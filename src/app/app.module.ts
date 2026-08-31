import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UrlCheckComponent } from './components/url-check/url-check.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    AdminDashboardComponent,
    NavbarComponent,
    UrlCheckComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    provideHttpClient(withFetch()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
  
