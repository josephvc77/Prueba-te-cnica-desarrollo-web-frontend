import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, this.noNumbersValidator]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      avatar: [null]
    });
  }

  noNumbersValidator(control: any) {
    if (control.value && /\d/.test(control.value)) {
      return { hasNumbers: true };
    }
    return null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private handleFile(file: File): void {
    // Validar que el tipo de archivo sea una imagen
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Por favor, selecciona únicamente archivos de imagen.';
      return;
    }

    // Limitar el tamaño del archivo a 2MB
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'La foto de perfil no debe superar los 2MB.';
      return;
    }

    this.errorMessage = '';
    this.selectedFile = file;
    this.registerForm.patchValue({ avatar: file });
    this.registerForm.get('avatar')?.updateValueAndValidity();

    // Crear una vista previa local de la URL del archivo
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('name', this.registerForm.get('name')?.value);
    formData.append('email', this.registerForm.get('email')?.value);
    formData.append('username', this.registerForm.get('username')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile, this.selectedFile.name);
    }

    this.authService.register(formData).subscribe({
      next: (response) => {
        this.loading = false;
        // Redirigir a la página de login en caso de éxito, con una bandera para mostrar el mensaje de éxito
        this.router.navigate(['/login'], { queryParams: { registered: 'success' } });
      },
      error: (err) => {
        this.loading = false;
        console.error('Error de registro:', err);
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 400) {
          this.errorMessage = 'Los datos proporcionados no son válidos.';
        } else {
          this.errorMessage = 'Ocurrió un error al intentar crear tu cuenta.';
        }
      }
    });
  }

  // Ayudantes para acceso a la plantilla
  isTouchedAndInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.touched && field.invalid);
  }
}
