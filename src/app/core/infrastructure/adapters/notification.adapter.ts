import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Preferences } from "@capacitor/preferences"
import { LocalNotifications } from "@capacitor/local-notifications"
import { Capacitor } from "@capacitor/core"
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from "@capacitor/push-notifications"
import { getAuth } from "@angular/fire/auth"
import {
  doc,
  getDoc,
  getFirestore,
  setDoc
} from "firebase/firestore"

@Injectable()
export class NotificationAdapter {
  private readonly apiUrl = "https://ravishing-courtesy-production.up.railway.app"
  private externalApiEmail = "zully.belenolopez@unicolombo.edu.co"
  private externalApiPassword = "12345Zully"

  constructor(private http: HttpClient) {}

  async loginToExternalApi(): Promise<void> {
    try {
      console.log("🔄 Iniciando sesión en API externa...")

      const response = await this.http
        .post<{ data: { access_token: string } }>(`${this.apiUrl}/user/login`, {
          email: this.externalApiEmail,
          password: this.externalApiPassword,
        })
        .toPromise()

      if (!response || !response.data || !response.data.access_token) {
        throw new Error("Respuesta inválida del servidor")
      }

      const token = response.data.access_token
      await Preferences.set({ key: "external_api_token", value: token })

      console.log("🔐 Token externo guardado correctamente:", token.substring(0, 10) + "...")

      // Enviar notificación de prueba después de iniciar sesión en la API externa
      await this.sendTestNotification()
    } catch (err) {
      console.error("❌ Error al iniciar sesión en la API externa", err)
      throw err
    }
  }

  async sendNotification(
    fcmTokenDestino: string,
    userId: string,
    meetingId: string,
    userFrom: string,
    nombre: string,
  ): Promise<void> {
    try {
      console.log("🔄 Preparando envío de notificación...")

      const tokenData = await Preferences.get({ key: "external_api_token" })
      let token = tokenData.value

      if (!token) {
        console.log("⚠️ Token no encontrado, iniciando sesión de nuevo...")
        await this.loginToExternalApi()
        const newTokenData = await Preferences.get({ key: "external_api_token" })
        token = newTokenData.value
      }

      if (!token) {
        throw new Error("No se pudo obtener un token de autenticación válido")
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      })

      if (!fcmTokenDestino || fcmTokenDestino.trim() === "") {
        throw new Error("Token FCM de destino inválido")
      }

      const body = {
        token: fcmTokenDestino,
        notification: {
          title: "Llamada entrante",
          body: `${nombre} te está llamando`
        },
        android: {
          priority: "high",
          data: {
            userId,
            meetingId,
            type: "incoming_call",
            name: nombre,
            userFrom
          }
        }
      }
      
      
      

      console.log("📤 Enviando notificación con datos:", JSON.stringify(body, null, 2))

      const response = await this.http.post(`${this.apiUrl}/notifications`, body, { headers }).toPromise()

      console.log("✅ Notificación enviada correctamente:", response)
    } catch (error: any) {
      console.error("❌ Error al enviar notificación:")
      if (error.status) {
        console.error(`🛑 Código de estado: ${error.status}`)
      }
      if (error.error) {
        try {
          const errorDetails = typeof error.error === "string" ? JSON.parse(error.error) : error.error
          console.error("📦 Detalles del error:", JSON.stringify(errorDetails, null, 2))
        } catch (parseErr) {
          console.error("📦 Error sin parsear:", error.error)
        }
      } else {
        console.error("⚠️ Error desconocido:", error)
      }

      throw error
    }
  }

  async initPushNotifications(): Promise<void> {
    if (Capacitor.getPlatform() === "web") {
      console.log("📱 Ejecutando en web - usando notificaciones locales")
      this.initWebNotifications()
    } else {
      console.log("📱 Ejecutando en dispositivo nativo - inicializando FCM")
      this.initNativeNotifications()
    }
  }

  private async initWebNotifications(): Promise<void> {
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

      console.log("📱 Notificaciones web inicializadas correctamente")
    } catch (error) {
      console.warn("⚠️ No se pudieron inicializar las notificaciones locales:", error)
    }
  }

  private async initNativeNotifications(): Promise<void> {
    try {
      const result = await PushNotifications.requestPermissions()

      if (result.receive === "granted") {
        await PushNotifications.register()

        PushNotifications.addListener("registration", (token: Token) => {
          console.log("Token FCM recibido:", token.value)
          this.saveFcmToken(token.value)
        })

        PushNotifications.addListener("pushNotificationReceived", (notification: PushNotificationSchema) => {
          console.log("Notificación recibida:", notification)
          this.handleIncomingNotification(notification)
        })

        PushNotifications.addListener("pushNotificationActionPerformed", (action: ActionPerformed) => {
          console.log("Acción realizada en notificación:", action)
          this.handleNotificationAction(action)
        })

        console.log("✅ Notificaciones nativas inicializadas correctamente")
      } else {
        console.warn("⚠️ Permisos de notificaciones denegados")
      }
    } catch (error) {
      console.error("❌ Error al inicializar notificaciones nativas:", error)
    }
  }

  private async saveFcmToken(token: string): Promise<void> {
    const auth = getAuth()
    const firestore = getFirestore()

    if (auth.currentUser) {
      const uid = auth.currentUser.uid
      try {
        await setDoc(
          doc(firestore, "users", uid),
          {
            fcmToken: token,
          },
          { merge: true },
        )
        console.log("✅ Token FCM guardado en Firestore")
      } catch (error) {
        console.error("❌ Error al guardar token FCM:", error)
      }
    } else {
      console.warn("⚠️ No hay usuario autenticado para guardar el token FCM")
    }
  }

  private async handleIncomingNotification(notification: PushNotificationSchema): Promise<void> {
    console.log("📩 Notificación recibida:", notification)

    const isIncomingCall = notification.data?.type === "incoming_call"

    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Math.random() * 10000),
          title: notification.title || (isIncomingCall ? "📞 Llamada entrante" : "🔔 Notificación"),
          body: notification.body || (isIncomingCall ? "Tienes una llamada entrante" : "Has iniciado sesión correctamente"),
          extra: notification.data,
          ongoing: isIncomingCall,
          schedule: { at: new Date(Date.now() + 500) },
          actionTypeId: isIncomingCall ? "INCOMING_CALL" : undefined,
        },
      ],
    })

    console.log("✅ Notificación visual mostrada")
  }

  private async handleNotificationAction(action: ActionPerformed): Promise<void> {
    const data = action.notification.data

    if (data && data.type === "incoming_call") {
      console.log("Acción en llamada entrante:", data)
    }
  }

  async sendTestNotification(): Promise<void> {
    try {
      if (Capacitor.getPlatform() === "web") {
        const permResult = await LocalNotifications.requestPermissions()

        if (permResult.display !== "granted") {
          console.warn("⚠️ Permisos de notificación no concedidos")
          return
        }

        await LocalNotifications.createChannel({
          id: "default",
          name: "Default Channel",
          importance: 5,
        })

        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 10000),
              title: "✅ Inicio de sesión exitoso",
              body: `Bienvenido a JitCall. Sesión iniciada a las ${new Date().toLocaleTimeString()}`,
              schedule: { at: new Date(Date.now() + 1000) },
              channelId: "default",
              smallIcon: "ic_notification",
              iconColor: "#6b7cff",
            },
          ],
        })

        console.log("✅ Notificación de prueba enviada")
      } else {
        const auth = getAuth()
        if (auth.currentUser) {
          const uid = auth.currentUser.uid
          const firestore = getFirestore()
          const userDocRef = doc(firestore, "users", uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists() && userDoc.data()?.['fcmToken']) {
            const fcmToken = userDoc.data()?.['fcmToken']

            await this.sendNotification(fcmToken, uid, "test-meeting-id", uid, "Notificación de prueba")

            console.log("✅ Notificación push de prueba enviada")
          } else {
            console.warn("⚠️ No se encontró token FCM para el usuario")
          }
        } else {
          console.warn("⚠️ No hay usuario autenticado para enviar notificación de prueba")
        }
      }
    } catch (error) {
      console.error("❌ Error al enviar notificación de prueba:", error)
    }
  }
}
