import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // 1. INICIAR SESIÓN
  login(credentials: { username: string; password?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          // Calcular y almacenar la fecha de expiración
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

    // Nota: Si no se proporcionan cabeceras, el backend devolverá 400.
    // Por defecto, enviaremos la cabecera de autorización aquí.
  // 3. OBTENER PERFIL (/me)
  getMe(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/me`, { headers });
  }

  // 4. CAMBIAR CONTRASEÑA (/change-password)
  changePassword(passwords: { oldPassword?: string; newPassword?: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/change-password`, passwords, { headers });
  }

  // Ayudante: Obtener el token JWT de localStorage
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Verificar si el token existe y no ha expirado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const expiresAtStr = localStorage.getItem('expires_at');
    if (!expiresAtStr) return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    return Date.now() < expiresAt;
  }

  // Obtener cabeceras HTTP con el token Bearer
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // 5. CERRAR SESIÓN
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
  }
}
