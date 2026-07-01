import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { FeedService } from '../../core/services/feed.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
  standalone: false
})
export class FeedComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  comments: any[] = [];
  commentForm!: FormGroup;
  passwordForm!: FormGroup;
  
  // Banderas de estado
  loadingProfile = true;
  loadingFeed = true;
  submittingComment = false;
  submittingPassword = false;
  showSettingsModal = false;
  activeSettingsTab = 'profile'; // 'profile' | 'password' | 'theme'
  isDarkTheme = false;

  // Mensajes de retroalimentación
  commentError = '';
  passwordError = '';
  passwordSuccess = '';

  private socketSubscription!: Subscription;
  private likeSubscription!: Subscription;
  private apiUrl = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private feedService: FeedService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicialización del tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    } else {
      this.isDarkTheme = false;
      document.body.classList.remove('dark-theme');
    }

    // Inicializar formularios
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    // 1. Obtener la información del usuario actual (/me)
    this.authService.getMe().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.loadingProfile = false;
      },
      error: (err) => {
        console.error('Error cargando datos del perfil:', err);
        this.loadingProfile = false;
        // Si falla la autenticación, forzar el cierre de sesión
        this.logout();
      }
    });

    // 2. Obtener la lista de comentarios (/feed GET)
    this.feedService.getFeed().subscribe({
      next: (feedData) => {
        this.comments = feedData;
        this.loadingFeed = false;
      },
      error: (err) => {
        console.error('Error cargando feed:', err);
        this.loadingFeed = false;
      }
    });

    // 3. Escuchar actualizaciones de comentarios en tiempo real mediante Socket.io
    this.socketSubscription = this.feedService.getNewComments().subscribe({
      next: (newComment) => {
        // Prevenir adiciones locales duplicadas
        if (!this.comments.some(c => c.id === newComment.id)) {
          // Agregar al principio del feed
          this.comments = [newComment, ...this.comments];
        }
      },
      error: (err) => {
        console.error('Error en WebSocket stream:', err);
      }
    });

    // 4. Escuchar me gusta/reacciones en tiempo real mediante Socket.io
    this.likeSubscription = this.feedService.getLikeUpdates().subscribe({
      next: (updatedComment) => {
        const index = this.comments.findIndex(c => c.id === updatedComment.id);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
      },
      error: (err) => {
        console.error('Error en WebSocket likes stream:', err);
      }
    });
  }

  // Enviar comentario al servidor (/feed POST)
  onSendComment(): void {
    if (this.commentForm.invalid) {
      return;
    }

    this.submittingComment = true;
    this.commentError = '';
    const content = this.commentForm.get('content')?.value;

    this.feedService.postComment(content).subscribe({
      next: (response) => {
        this.submittingComment = false;
        this.commentForm.reset();
        // El oyente del socket se encargará de colocar el comentario en la lista
      },
      error: (err) => {
        this.submittingComment = false;
        console.error('Error publicando comentario:', err);
        if (err.error && err.error.message) {
          this.commentError = err.error.message;
        } else {
          this.commentError = 'No se pudo publicar el comentario.';
        }
      }
    });
  }

  // Cambiar contraseña (/change-password POST)
  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.submittingPassword = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    const { oldPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ oldPassword, newPassword }).subscribe({
      next: (response) => {
        this.submittingPassword = false;
        this.passwordSuccess = response.message || 'Contraseña actualizada correctamente.';
        this.passwordForm.reset();
        
        // Cerrar el modal después de un retraso
        setTimeout(() => {
          this.toggleSettingsModal(false);
        }, 2000);
      },
      error: (err) => {
        this.submittingPassword = false;
        console.error('Error cambiando contraseña:', err);
        if (err.error && err.error.message) {
          this.passwordError = err.error.message;
        } else if (err.status === 403) {
          this.passwordError = 'Acceso denegado: falta cabecera de autenticación.';
        } else if (err.status === 401) {
          this.passwordError = 'Token de autenticación incorrecto o expirado.';
        } else {
          this.passwordError = 'No se pudo actualizar la contraseña. Revisa tus datos.';
        }
      }
    });
  }

  // Alternar el modal de configuración
  toggleSettingsModal(show: boolean): void {
    this.showSettingsModal = show;
    this.activeSettingsTab = 'profile';
    this.passwordError = '';
    this.passwordSuccess = '';
    this.passwordForm.reset();
  }

  // Cambiar la pestaña activa del modal de configuración
  setSettingsTab(tab: string): void {
    this.activeSettingsTab = tab;
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  // Alternar entre modo Claro y Oscuro
  toggleTheme(isDark: boolean): void {
    this.isDarkTheme = isDark;
    if (isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  // Ayudante para formatear la URL de la imagen del avatar
  getAvatarUrl(avatarPath: string | null): string {
    if (!avatarPath) {
      return 'assets/default-avatar.png'; // Respaldo
    }
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    return `${this.apiUrl}${avatarPath}`;
  }

  logout(): void {
    this.authService.logout();
    this.feedService.disconnectSocket();
    this.router.navigate(['/login']);
  }

  // Acción de Dar/Quitar "me gusta"
  onToggleLike(commentId: string): void {
    this.feedService.likeComment(commentId).subscribe({
      next: (res) => {
        const index = this.comments.findIndex(c => c.id === commentId);
        if (index !== -1 && res.comment) {
          this.comments[index] = res.comment;
        }
      },
      error: (err) => {
        console.error('Error al cambiar reacción:', err);
      }
    });
  }

  isCommentLiked(comment: any): boolean {
    if (!comment || !comment.likes || !this.currentUser) return false;
    return comment.likes.includes(this.currentUser.id);
  }

  getLikesCount(comment: any): number {
    if (!comment || !comment.likes) return 0;
    return comment.likes.length;
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    if (this.likeSubscription) {
      this.likeSubscription.unsubscribe();
    }
  }
}
