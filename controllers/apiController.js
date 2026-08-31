const axios = require('axios');
const Response = require('../models/response');
const NodeCache = require('node-cache');
const qs = require('qs');
const mongoose = require('mongoose');
const { virusTotalApiKey } = require('../config/env');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const MALICIOUS_VERDICT_THRESHOLD = 3;

const isValidUrl = (url) => {
  const regex = /^(https?:\/\/)((\[[0-9a-fA-F:.]+\])|(([a-zA-Z\d]([a-zA-Z\d-]*[a-zA-Z\d])*)\.)+[a-zA-Z]{2,})(:\d+)?(\/[-a-zA-Z\d%_.~+]*)*(\?[;&a-zA-Z\d%_.~+=-]*)?(#[-a-zA-Z\d_]*)?$/i;
  return regex.test(url);
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const persistResponse = async ({ url, userId, result, status }) => {
  return Response.findOneAndUpdate(
    { url, user: userId },
    { url, result, status, user: userId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAnalysisResult = async (scanId, headers) => {
  let lastResponse;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    lastResponse = await axios.get(`https://www.virustotal.com/api/v3/analyses/${scanId}`, {
      headers,
      timeout: 15000,
    });

    if (lastResponse.data?.data?.attributes?.status === 'completed') {
      return lastResponse;
    }

    await wait(2000);
  }

  return lastResponse;
};

const getSafetyStatus = (stats = {}) => {
  const malicious = Number(stats.malicious) || 0;
  const suspicious = Number(stats.suspicious) || 0;

  // Avoid false positives from isolated vendor outliers.
  if (malicious >= MALICIOUS_VERDICT_THRESHOLD) {
    return 'no seguro';
  }

  if (malicious >= 2 && suspicious > 0) {
    return 'no seguro';
  }

  return 'seguro';
};

exports.consultarURL = async (req, res) => {
  let url;
  let processingKey;
  try {
    ({ url } = req.body);

    if (!url || typeof url !== 'string' || !isValidUrl(url)) {
      return res.status(400).json({ message: 'URL inválida o no proporcionada.' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!virusTotalApiKey) {
      return res.status(503).json({ message: 'La integración con VirusTotal no está configurada.' });
    }

    const userId = req.user._id;

    const cachedResponse = cache.get(url);
    if (cachedResponse) {
      const savedResponse = await persistResponse({
        url,
        userId,
        result: cachedResponse.data,
        status: cachedResponse.status,
      });

      return res.status(200).json({
        message: 'Consulta realizada con éxito (caché)',
        status: cachedResponse.status,
        data: savedResponse,
      });
    }

    processingKey = `processing-${url}`;
    if (cache.get(processingKey)) {
      return res.status(429).json({ message: 'La URL ya está en proceso, intenta más tarde.' });
    }

    cache.set(processingKey, true, 30);

    const headers = {
      'x-apikey': virusTotalApiKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    const scanResponse = await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      qs.stringify({ url }),
      { headers, timeout: 15000 }
    );

    const scanId = scanResponse.data.data.id;
    const getResponse = await fetchAnalysisResult(scanId, headers);

    if (getResponse.data?.data?.attributes?.status !== 'completed') {
      return res.status(504).json({ message: 'El análisis tardó demasiado en completarse.' });
    }

    const stats = getResponse.data?.data?.attributes?.stats || {};
    const status = getSafetyStatus(stats);

    const savedResponse = await persistResponse({
      url,
      userId,
      result: getResponse.data,
      status,
    });

    cache.set(url, { status, data: getResponse.data }, 300);

    return res.status(200).json({
      message: 'Consulta realizada con éxito',
      status,
      data: savedResponse,
    });

  } catch (error) {
    console.error('Error en la consulta:', error.response?.data || error.message);

    return res.status(error.response?.status || 500).json({
      message: 'Error en la consulta',
      error: error.response?.data || error.message,
    });
  } finally {
    if (processingKey) {
      cache.del(processingKey);
    }
  }
};

exports.getUrls = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 10, 100));
    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);

    const urls = await Response.find()
      .populate('user', 'email _id')
      .select('url status createdAt user')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await Response.countDocuments();

    res.json({
      total,
      count: urls.length,
      data: urls,
    });
  } catch (err) {
    console.error('Error al obtener URLs:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.getMyUrls = async (req, res) => {
  try {
    const urls = await Response.find({ user: req.user._id })
      .select('url status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      total: urls.length,
      count: urls.length,
      data: urls,
    });
  } catch (error) {
    console.error('Error al obtener las consultas del usuario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.getResponseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID de reporte inválido' });
    }

    const responseDoc = await Response.findById(id)
      .populate('user', 'email _id')
      .lean();

    if (!responseDoc) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    const isOwner = responseDoc.user?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No tienes permisos para ver este reporte' });
    }

    res.status(200).json({
      message: 'Reporte obtenido exitosamente',
      response: responseDoc,
    });
  } catch (error) {
    console.error('Error al obtener el reporte:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.deleteResponse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'ID de reporte inválido' });
    }

    const deletedResponse = await Response.findByIdAndDelete(id);

    if (!deletedResponse) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }

    res.status(200).json({ message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el reporte:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
