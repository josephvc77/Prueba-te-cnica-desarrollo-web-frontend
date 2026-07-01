import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Verificar si fue redirigido desde el registro
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'success') {
        this.successMessage = '¡Registro exitoso! Por favor inicia sesión.';
      }
    });
  }


  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        this.loading = false;
        // Redirigir al feed en caso de éxito
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error de login:', err);
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        } else if (err.status === 400) {
          this.errorMessage = 'Debe ingresar todos los datos requeridos.';
        } else {
          this.errorMessage = 'Ocurrió un error inesperado al intentar iniciar sesión.';
        }
      }
    });
  }

  // Ayudantes para acceso a la plantilla
  isTouchedAndInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.touched && field.invalid);
  }
}
