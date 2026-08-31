# URL Shield

URL Shield es una plataforma web para analizar URLs sospechosas. Permite registrar usuarios, iniciar sesión, consultar enlaces mediante VirusTotal, conservar un historial por cuenta y administrar usuarios y reportes con permisos de administrador.

## Estructura

```text
URL-Shield-Project/
├── frontend/    # Angular 18: interfaz, rutas protegidas y UX/UI
└── backend/     # Node.js + Express: API REST, MongoDB y VirusTotal
```

## Tecnologías

| Capa | Tecnologías |
| --- | --- |
| Frontend | Angular 18, TypeScript, RxJS, Angular Router, HttpClient |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Seguridad | JWT, bcryptjs, Helmet, CORS y control de roles |
| Análisis | VirusTotal API v3 |

## Funcionalidades

- Registro e inicio de sesión con JWT.
- Roles de usuario y administrador.
- Análisis de URLs con VirusTotal.
- Regla de veredicto ajustada para reducir falsos positivos aislados.
- Historial de consultas por usuario.
- Panel administrativo para usuarios y reportes.

## Ejecución local

### Backend

```bash
cd backend
cp .env.example .env.local
npm install
npm start
```

Configura en `.env.local` `MONGO_URI`, `SECRET_KEY`, `API_KEY` y las credenciales de administrador antes de iniciar.

### Frontend

```bash
cd frontend
npm install
npm start
```

El frontend se sirve por defecto en `http://127.0.0.1:4200` y enruta `/api` hacia el backend mediante su proxy de desarrollo.

## Seguridad

No subas archivos `.env.local`, claves de VirusTotal, secretos JWT ni credenciales de administrador. El repositorio incluye plantillas y reglas de exclusión para mantener esos datos fuera de Git.
