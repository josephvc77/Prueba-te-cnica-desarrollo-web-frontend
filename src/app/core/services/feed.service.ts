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

  // Establish connection to the Socket.io WebSocket server
  private connectSocket(): void {
    this.socket = io(this.apiUrl);

    this.socket.on('connect', () => {
      console.log('Conectado con éxito al socket de tiempo real.');
    });

    // Listen for new comments broadcasted by the server
    this.socket.on('new_comment', (comment: any) => {
      this.newCommentSubject.next(comment);
    });

    // Listen for real-time like updates
    this.socket.on('like_update', (comment: any) => {
      this.likeUpdateSubject.next(comment);
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del socket de tiempo real.');
    });
  }

  // Expose real-time comments stream as Observable
  getNewComments(): Observable<any> {
    return this.newCommentSubject.asObservable();
  }

  // Expose real-time like updates stream as Observable
  getLikeUpdates(): Observable<any> {
    return this.likeUpdateSubject.asObservable();
  }

  // HTTP GET: Fetch list of comments
  getFeed(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/feed`, { headers });
  }

  // HTTP POST: Publish a comment
  postComment(content: string): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/feed`, { content }, { headers });
  }

  // HTTP POST: Like/Unlike a comment
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

