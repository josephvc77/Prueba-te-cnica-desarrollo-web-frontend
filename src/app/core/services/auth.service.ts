import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // 1. INICIAR SESIÓN (las cookies se guardan automáticamente por el navegador)
  login(credentials: { username: string; password?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Al usar Cookies HttpOnly, JavaScript no puede acceder al token.
        // Guardamos un flag booleano de sesión local y el tiempo de expiración.
        localStorage.setItem('logged_in', 'true');
        if (response && response.expiration) {
          const expiresAt = Date.now() + response.expiration * 1000;
          localStorage.setItem('expires_at', expiresAt.toString());
        }
      })
    );
  }

  // 2. REGISTRAR (recibe FormData debido a la subida de archivos de Multer)
  register(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, formData);
  }

  // 3. OBTENER PERFIL (/me)
  getMe(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  // 4. CAMBIAR CONTRASEÑA (/change-password)
  changePassword(passwords: { oldPassword?: string; newPassword?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, passwords);
  }

  // Ayudante compatible: ya no almacena el JWT en el cliente por seguridad
  getToken(): string | null {
    return null;
  }

  // Verificar si la sesión existe y no ha expirado localmente
  isAuthenticated(): boolean {
    const isLoggedIn = localStorage.getItem('logged_in') === 'true';
    if (!isLoggedIn) return false;

    const expiresAtStr = localStorage.getItem('expires_at');
    if (!expiresAtStr) return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    return Date.now() < expiresAt;
  }

  // Ayudante compatible para cabeceras (retorna vacío ya que las cookies se inyectan automáticamente)
  getAuthHeaders(): any {
    return {};
  }

  // 5. CERRAR SESIÓN (invalida la sesión en el servidor y limpia localmente)
  logout(): Observable<any> {
    localStorage.removeItem('logged_in');
    localStorage.removeItem('expires_at');
    return this.http.post<any>(`${this.apiUrl}/logout`, {});
  }
}
