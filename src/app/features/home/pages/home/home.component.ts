import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core"
import { Router } from "@angular/router"
import { LoadingController, ModalController, ToastController } from "@ionic/angular"
import { ContactService } from "../../services/contact.service"
import { AuthService } from "../../../auth/services/auth.service"
import { IncomingCallComponent } from "src/app/shared/components/incomingCall/IncomingCall.component"
import { CallService } from "../../../call/services/call.service"
import { ContactEntity } from "src/app/core/domain/entities/user.entity"
import { Capacitor } from "@capacitor/core"
import { CallHistoryService } from "src/app/features/call/services/call-history.service"
import { CallHistoryEntity } from "src/app/core/domain/entities/call-history.entity"
import { Subscription } from "rxjs"

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  standalone: false,
})
export class HomeComponent implements OnInit, OnDestroy {
  contacts: ContactEntity[] = []
  filteredContacts: ContactEntity[] = []
  recentCalls: CallHistoryEntity[] = []
  isLoading = false
  searchTerm = ""
  userName = "Usuario"
  selectedTab = "contacts"

  private subscriptions: Subscription[] = []

  constructor(
    private contactService: ContactService,
    private authService: AuthService,
    private callService: CallService,
    private callHistoryService: CallHistoryService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadContacts()
    this.loadUserName()
    this.loadCallHistory()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  async loadUserName() {
    try {
      const user = await this.authService.getCurrentUser()
      if (user && user.nombre) {
        this.userName = user.nombre
        this.cd.detectChanges()
      }
    } catch (error) {
      console.error("Error al cargar nombre de usuario:", error)
    }
  }

  loadContacts() {
    const contactSub = this.contactService.getContacts().subscribe(async (contacts) => {
      const updatedContacts = await Promise.all(
        contacts.map(async (contact) => {
          const userData = await this.contactService.getContactDataById(contact.uid)
          return { ...contact, ...userData }
        }),
      )

      this.contacts = updatedContacts
      this.filteredContacts = [...this.contacts]
    })

    this.subscriptions.push(contactSub)
  }

  loadCallHistory() {
    const historySub = this.callHistoryService.getCallHistory().subscribe((calls) => {
      this.recentCalls = calls
    })

    this.subscriptions.push(historySub)
  }

  filterContacts() {
    if (!this.searchTerm) {
      this.filteredContacts = [...this.contacts]
      return
    }

    const term = this.searchTerm.toLowerCase()
    this.filteredContacts = this.contacts.filter(
      (contact) =>
        contact.nombre.toLowerCase().includes(term) ||
        contact.apellido.toLowerCase().includes(term) ||
        contact.telefono.toLowerCase().includes(term),
    )
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value
  }

  isContactOnline(contact: ContactEntity): boolean {
    return Math.random() > 0.5
  }

  goToAddContact() {
    this.router.navigate(["/home/add-contact"])
  }

  async logout() {
    await this.authService.logout()
    this.router.navigate(["/auth/login"])
  }

  async onCall(contact: ContactEntity) {
    this.isLoading = true

    try {
      // Verificar si el contacto tiene un token FCM válido
      if (!contact.fcmToken && Capacitor.getPlatform() !== "web") {
        this.presentToast(
          "Este contacto no tiene un token de notificaciones válido. No podrá recibir la llamada.",
          "warning",
        )
      }

      console.log(`📞 Iniciando llamada a: ${contact.nombre} ${contact.apellido}`)

      const meetingId = await this.callService.initiateCall(contact)

      if (meetingId) {
        console.log(`✅ Llamada iniciada con ID: ${meetingId}`)

        if (Capacitor.getPlatform() === "web") {
          const modal = await this.modalController.create({
            component: IncomingCallComponent,
            componentProps: {
              userFrom: contact.uid,
              name: `${contact.nombre} ${contact.apellido}`,
              meetingId,
            },
            backdropDismiss: false,
            cssClass: "incoming-call-modal",
          })

          await modal.present()

          const { data } = await modal.onDidDismiss()

          if (data && data.accepted) {
            await this.callService.joinJitsiMeeting(meetingId, data.callId)
          } else if (data && !data.accepted && data.callId) {
            await this.callService.rejectCall(data.callId)
          }
        } else {
          this.presentToast(`Llamando a ${contact.nombre}...`, "success")
        }
      } else {
        this.presentToast("No se pudo iniciar la llamada", "danger")
      }
    } catch (error) {
      console.error("❌ Error al iniciar llamada:", error)

      let errorMessage = "Error al iniciar la llamada"

      if (error instanceof Error && error.message) {
        errorMessage = error.message
      }
      if (typeof error === "object" && error !== null && "status" in error) {
        const err = error as any
        if (err.status === 500) {
          errorMessage = "Error en el servidor de notificaciones. Intenta más tarde."
        }
      }

      this.presentToast(errorMessage, "danger")
    } finally {
      this.isLoading = false
    }
  }

  viewContactProfile(contact: ContactEntity) {
    this.router.navigate([`/home/contact/${contact.uid}`])
  }

  async deleteCallRecord(callId: string) {
    try {
      await this.callHistoryService.deleteCallRecord(callId)
      this.presentToast("Registro de llamada eliminado", "success")
    } catch (error) {
      console.error("Error al eliminar registro de llamada:", error)
      this.presentToast("Error al eliminar el registro", "danger")
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

  mapCallToContact(call: CallHistoryEntity): ContactEntity {
    const [nombre, ...apellidos] = call.contactName.split(' ')
    return {
      uid: call.id,
      nombre,
      apellido: apellidos.join(' ') || '',
      fcmToken: '',
    } as ContactEntity
  }
}
