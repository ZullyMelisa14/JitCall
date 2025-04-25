import { Component } from "@angular/core"
import { Platform, ModalController } from "@ionic/angular"
import { IncomingCallComponent } from "./shared/components/incomingCall/IncomingCall.component"
import { LocalNotifications } from "@capacitor/local-notifications"
import { Capacitor } from "@capacitor/core"
import { PushNotifications, ActionPerformed, PushNotificationSchema } from "@capacitor/push-notifications"
import { CallService } from "./features/call/services/call.service"
import { CallHistoryService } from "./features/call/services/call-history.service"

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private modalController: ModalController,
    private callService: CallService,
    private callHistoryService: CallHistoryService,
  ) {
    this.platform.ready().then(() => {
      this.initNotifications()
    })
  }

  async initNotifications() {
    // Verificamos si estamos en web
    if (Capacitor.getPlatform() === "web") {
      console.log("📱 Ejecutando en web - inicializando notificaciones web")
      this.initWebNotifications()
    } else {
      console.log("📱 Ejecutando en dispositivo nativo - inicializando notificaciones nativas")
      this.initNativeNotifications()
    }
  }

  async initWebNotifications() {
    try {
      const permResult = await LocalNotifications.requestPermissions()
      console.log("📱 Permisos de notificación:", permResult)
      if (permResult.display !== "granted") {
        console.warn("⚠️ Permisos de notificación no concedidos")
        return
      }

      await LocalNotifications.createChannel({
        id: "default",
        name: "Default Channel",
        importance: 5,
      })

      LocalNotifications.addListener("localNotificationReceived", async (notification) => {
        console.log("📥 Notificación local recibida:", notification)

        if (notification.extra && notification.extra.type === "incoming_call") {
          // Registrar la llamada entrante en el historial
          const callId = await this.callHistoryService.logIncomingCall(
            notification.extra.userFrom,
            notification.extra.name,
            notification.extra.meetingId,
          )

          // Pasar el callId al modal para actualizar el estado
          notification.extra.callId = callId
          await this.presentIncomingCallModal(notification.extra)
        }
      })

      LocalNotifications.addListener("localNotificationActionPerformed", (notification) => {
        console.log("📲 Notificación local tocada:", notification)

        // Verificar si es una llamada entrante
        if (notification.notification.extra && notification.notification.extra.type === "incoming_call") {
          this.presentIncomingCallModal(notification.notification.extra)
        }
      })

      console.log("✅ Notificaciones web inicializadas correctamente")
    } catch (error) {
      console.error("❌ Error al inicializar notificaciones web:", error)
    }
  }
  // Inicializar notificaciones nativas
  async initNativeNotifications() {
    try {
      // Verificar si el plugin está disponible
      if (Capacitor.isPluginAvailable("PushNotifications")) {
        // Solicitar permisos
        const result = await PushNotifications.requestPermissions()

        if (result.receive === "granted") {
          // Registrar el dispositivo para recibir notificaciones
          await PushNotifications.register()

          // Escuchar el evento de registro
          PushNotifications.addListener("registration", (token) => {
            console.log("Token de push:", token.value)
          })

          PushNotifications.addListener("pushNotificationReceived", async (notification: PushNotificationSchema) => {
            console.log("Notificación recibida:", notification)

            // Verificar si es una llamada entrante
            if (notification.data && notification.data.type === "incoming_call") {
              // Registrar la llamada entrante en el historial
              const callId = await this.callHistoryService.logIncomingCall(
                notification.data.userFrom,
                notification.data.name,
                notification.data.meetingId,
              )

              // Pasar el callId al modal para actualizar el estado
              notification.data.callId = callId
              await this.presentIncomingCallModal(notification.data)
            }
          })

          PushNotifications.addListener("pushNotificationActionPerformed", (action: ActionPerformed) => {
            console.log("Acción en notificación:", action)

            // Verificar si es una llamada entrante
            if (action.notification.data && action.notification.data.type === "incoming_call") {
              this.presentIncomingCallModal(action.notification.data)
            }
          })

          console.log("✅ Notificaciones nativas inicializadas correctamente")
        } else {
          console.warn("⚠️ Permisos de notificaciones denegados")
        }
      } else {
        console.warn("⚠️ Plugin PushNotifications no disponible")
      }
    } catch (error) {
      console.error("❌ Error al inicializar notificaciones nativas:", error)
    }
  }

  // Método para presentar el modal de llamada entrante
  async presentIncomingCallModal(data: any) {
    const modal = await this.modalController.create({
      component: IncomingCallComponent,
      componentProps: {
        userFrom: data.userFrom,
        name: data.name,
        meetingId: data.meetingId,
        callId: data.callId,
      },
      backdropDismiss: false,
      cssClass: "incoming-call-modal",
    })

    await modal.present()

    const { data: result } = await modal.onDidDismiss()

    if (result && result.accepted) {
      await this.callService.joinJitsiMeeting(result.meetingId, result.callId)
    } else if (result && !result.accepted && result.callId) {
      await this.callService.rejectCall(result.callId)
    }
  }
}
