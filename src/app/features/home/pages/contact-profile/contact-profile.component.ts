import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { AlertController, LoadingController, ToastController } from "@ionic/angular"
import { ContactService } from "../../services/contact.service"
import { CallService } from "../../../call/services/call.service"

@Component({
  selector: "app-contact-profile",
  templateUrl: "./contact-profile.component.html",
  styleUrls: ["./contact-profile.component.scss"],
  standalone: false,
})
export class ContactProfileComponent implements OnInit {
  contactId = ""
  contact: any = null
  isLoading = true
  isEditing = false
  editForm: FormGroup

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contactService: ContactService,
    private callService: CallService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private fb: FormBuilder,
  ) {
    this.editForm = this.fb.group({
      telefono: ["", [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    })
  }

  ngOnInit() {
    this.contactId = this.route.snapshot.paramMap.get("id") || ""
    if (this.contactId) {
      this.loadContactData()
    } else {
      this.presentToast("ID de contacto no válido", "danger")
      this.router.navigate(["/home"])
    }
  }

  async loadContactData() {
    this.isLoading = true
    try {
      const contacts = await this.contactService.getContacts().toPromise()

      if (!contacts) {
        throw new Error("No se pudieron obtener los contactos")
      }

      const contact = contacts.find((c) => c.uid === this.contactId)

      if (contact) {
        this.contact = contact
        this.editForm.patchValue({
          telefono: contact.telefono,
        })
      } else {
        throw new Error("Contacto no encontrado")
      }
    } catch (error) {
      console.error("Error al cargar datos del contacto:", error)
      this.presentToast("Error al cargar datos del contacto", "danger")
      this.router.navigate(["/home"])
    } finally {
      this.isLoading = false
    }
  }

  getFullName(): string {
    if (!this.contact) return ""
    return `${this.contact.nombre} ${this.contact.apellido}`
  }

  async initiateCall() {
    if (!this.contact) return

    const loading = await this.loadingController.create({
      message: "Iniciando llamada...",
    })
    await loading.present()

    try {
      const meetingId = await this.callService.initiateCall(this.contact)
      if (meetingId) {
        this.presentToast(`Llamando a ${this.getFullName()}...`, "success")
      } else {
        this.presentToast("No se pudo iniciar la llamada", "danger")
      }
    } catch (error) {
      console.error("Error al iniciar llamada:", error)
      this.presentToast("Error al iniciar la llamada", "danger")
    } finally {
      await loading.dismiss()
    }
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing
    if (!this.isEditing) {
      this.editForm.patchValue({
        telefono: this.contact.telefono,
      })
    }
  }

  async saveChanges() {
    if (this.editForm.invalid) {
      this.presentToast("Por favor ingresa un número de teléfono válido", "warning")
      return
    }

    const newPhone = this.editForm.value.telefono

    if (newPhone === this.contact.telefono) {
      this.isEditing = false
      return
    }

    const loading = await this.loadingController.create({
      message: "Guardando cambios...",
    })
    await loading.present()

    try {
      await this.contactService.updateContactPhone(this.contactId, newPhone)
      this.contact.telefono = newPhone
      this.isEditing = false
      this.presentToast("Número de teléfono actualizado", "success")
    } catch (error) {
      console.error("Error al actualizar contacto:", error)
      this.presentToast("Error al actualizar el contacto", "danger")
    } finally {
      await loading.dismiss()
    }
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: "Confirmar eliminación",
      message: `¿Estás seguro de que deseas eliminar a ${this.getFullName()} de tus contactos?`,
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
        },
        {
          text: "Eliminar",
          role: "destructive",
          handler: () => {
            this.deleteContact()
          },
        },
      ],
    })

    await alert.present()
  }

  async deleteContact() {
    const loading = await this.loadingController.create({
      message: "Eliminando contacto...",
    })
    await loading.present()

    try {
      await this.contactService.deleteContact(this.contactId)
      this.presentToast("Contacto eliminado", "success")
      this.router.navigate(["/home"])
    } catch (error) {
      console.error("Error al eliminar contacto:", error)
      this.presentToast("Error al eliminar el contacto", "danger")
    } finally {
      await loading.dismiss()
    }
  }

  goBack() {
    this.router.navigate(["/home"])
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
