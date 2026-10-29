import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isSubmitting = false;
  selectedRole: 'student' | 'teacher' = 'student';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  setRole(role: 'student' | 'teacher'): void {
    this.selectedRole = role;
    if (role === 'student') {
      this.loginForm.patchValue({
        email: 'estudiante@saberstyle.com',
        password: 'password123'
      });
    } else {
      this.loginForm.patchValue({
        email: 'profesor@saberstyle.com',
        password: 'password123'
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      await this.presentToast('Por favor completa los campos correctamente.', 'warning');
      return;
    }

    this.isSubmitting = true;

    // Ejecución inmediata sin overlays pesados para evitar congelamientos
    setTimeout(async () => {
      try {
        const { email, password } = this.loginForm.value;
        const result = this.authService.login({ email, password });

        this.isSubmitting = false;

        if (result.success) {
          await this.presentToast(result.message, 'success');
          this.loginForm.reset();
          this.router.navigate(['/home'], { replaceUrl: true });
        } else {
          await this.presentToast(result.message, 'danger');
        }
      } catch (err) {
        this.isSubmitting = false;
        await this.presentToast('Ocurrió un error al procesar el inicio de sesión.', 'danger');
      }
    }, 200);
  }

  async forgotPassword(): Promise<void> {
    const alert = await this.alertController.create({
      header: '¿Olvidaste tu contraseña?',
      message: 'Ingresa tu correo registrado y te enviaremos un código de recuperación galáctico:',
      inputs: [
        {
          name: 'recoveryEmail',
          type: 'email',
          placeholder: 'correo@ejemplo.com',
          value: this.loginForm.value.email || ''
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar Enlace',
          handler: (data) => {
            if (data.recoveryEmail?.trim()) {
              this.presentToast(`Enlace enviado a ${data.recoveryEmail.trim()} (o usa contraseña: password123)`, 'success');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async loginWithSocial(provider: 'Google' | 'Apple' | 'Gamepad'): Promise<void> {
    this.isSubmitting = true;
    setTimeout(async () => {
      this.isSubmitting = false;
      const role = this.selectedRole;
      const demoEmail = role === 'teacher' ? 'profesor@saberstyle.com' : 'estudiante@saberstyle.com';
      this.authService.login({ email: demoEmail, password: 'password123' });
      await this.presentToast(`Conectado con éxito mediante ${provider}`, 'success');
      this.router.navigate(['/home'], { replaceUrl: true });
    }, 300);
  }

  fillStudentDemo(): void {
    this.setRole('student');
  }

  fillTeacherDemo(): void {
    this.setRole('teacher');
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      buttons: [
        {
          text: '✕',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
