import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clonar la solicitud para inyectar withCredentials: true y habilitar el transporte automático de Cookies HttpOnly
    const credentialsReq = req.clone({
      withCredentials: true
    });
    return next.handle(credentialsReq);
  }
}
