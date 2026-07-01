import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FeedService implements OnDestroy {
  private apiUrl = 'http://localhost:3000';
  private socket!: Socket;
  private newCommentSubject = new Subject<any>();
  private likeUpdateSubject = new Subject<any>();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.connectSocket();
  }

  // Establecer conexión con el servidor WebSocket de Socket.io
  private connectSocket(): void {
    this.socket = io(this.apiUrl);

    this.socket.on('connect', () => {
      console.log('Conectado con éxito al socket de tiempo real.');
    });

    // Escuchar nuevos comentarios emitidos por el servidor
    this.socket.on('new_comment', (comment: any) => {
      this.newCommentSubject.next(comment);
    });

    // Escuchar actualizaciones de "me gusta" en tiempo real
    this.socket.on('like_update', (comment: any) => {
      this.likeUpdateSubject.next(comment);
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del socket de tiempo real.');
    });
  }

  // Exponer el flujo de comentarios en tiempo real como Observable
  getNewComments(): Observable<any> {
    return this.newCommentSubject.asObservable();
  }

  // Exponer el flujo de actualizaciones de "me gusta" en tiempo real como Observable
  getLikeUpdates(): Observable<any> {
    return this.likeUpdateSubject.asObservable();
  }

  // HTTP GET: Obtener la lista de comentarios
  getFeed(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/feed`, { headers });
  }

  // HTTP POST: Publicar un comentario
  postComment(content: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/feed`, { content }, { headers });
  }

  // HTTP POST: Dar/Quitar "me gusta" a un comentario
  likeComment(commentId: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/feed/${commentId}/like`, {}, { headers });
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  ngOnDestroy(): void {
    this.disconnectSocket();
  }
}

