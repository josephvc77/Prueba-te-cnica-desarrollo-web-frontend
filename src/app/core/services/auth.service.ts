import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // 1. LOGIN
  login(credentials: { username: string; password?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          // Calculate and store expiration date
          const expiresAt = Date.now() + response.expiration * 1000;
          localStorage.setItem('expires_at', expiresAt.toString());
        }
      })
    );
  }

  // 2. REGISTER (receives FormData because of Multer file upload)
  register(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, formData);
  }

  // 3. GET PROFILE (/me)
  getMe(): Observable<any> {
    // Note: If no headers are provided, backend will return 400.
    // The HTTP interceptor will inject the header, but if we want to test missing headers,
    // we can pass custom headers or check. By default, we will send the authorization header here.
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/me`, { headers });
  }

  // 4. CHANGE PASSWORD (/change-password)
  changePassword(passwords: { oldPassword?: string; newPassword?: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/change-password`, passwords, { headers });
  }

  // Helper: Get JWT token from localStorage
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Check if token exists and is not expired
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const expiresAtStr = localStorage.getItem('expires_at');
    if (!expiresAtStr) return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    return Date.now() < expiresAt;
  }

  // Get HTTP headers with Bearer token
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // 5. LOGOUT
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('expires_at');
  }
}
