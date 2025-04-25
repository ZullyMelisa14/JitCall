import { Component } from "@angular/core"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { ToastController } from "@ionic/angular"
import { AuthService } from "../../services/auth.service"
import { LocalNotifications } from "@capacitor/local-notifications"
import { Capacitor } from "@capacitor/core"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  standalone: false,
})
export class LoginComponent {
  loginForm: FormGroup
  isLoading = false
  showPassword = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    })
  }

  async onSubmit() {
    if (this.loginForm.invalid) return

    const { email, password } = this.loginForm.value
    this.isLoading = true

    try {
      await this.authService.login(email, password)

      // Mostrar notificación de prueba después del login exitoso
      await this.showLoginSuccessNotification()

      this.router.navigate(["/home"])
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error)
      this.presentToast(errorMessage, "danger")
    } finally {
      this.isLoading = false
    }
  }

  async showLoginSuccessNotification() {
    try {
      // Verificar si estamos en web o en dispositivo nativo
      if (Capacitor.getPlatform() === "web") {
        // Solicitar permisos para notificaciones locales
        const permResult = await LocalNotifications.requestPermissions()

        if (permResult.display !== "granted") {
          console.warn("⚠️ Permisos de notificación no concedidos")
          return
        }

        // Crear un canal de notificaciones por defecto si no existe
        await LocalNotifications.createChannel({
          id: "default",
          name: "Default Channel",
          importance: 5,
        })

        // Enviar notificación de prueba
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 10000),
              title: "✅ Inicio de sesión exitoso",
              body: `Bienvenido a CallJit. Sesión iniciada a las ${new Date().toLocaleTimeString()}`,
              schedule: { at: new Date(Date.now() + 1000) },
              channelId: "default",
              smallIcon: "ic_notification",
              iconColor: "#6b7cff",
            },
          ],
        })

        console.log("✅ Notificación de prueba enviada")
      } else {
        // En dispositivos nativos, el servicio de notificaciones se encargará
        // de mostrar la notificación a través del método loginToExternalApi
        console.log("📱 Ejecutando en dispositivo nativo - notificación manejada por el servicio")
      }
    } catch (error) {
      console.error("❌ Error al enviar notificación de prueba:", error)
    }
  }

  goToRegister() {
    this.router.navigate(["/auth/register"])
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }

  private getErrorMessage(error: any): string {
    const errorCode = error.code
    switch (errorCode) {
      case "auth/user-not-found":
        return "No existe una cuenta con este correo electrónico"
      case "auth/wrong-password":
        return "Contraseña incorrecta"
      case "auth/invalid-credential":
        return "Credenciales inválidas"
      default:
        return "Error al iniciar sesión: " + (error.message || "Intenta nuevamente")
    }
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: "top",
    })
    await toast.present()
  }
}
