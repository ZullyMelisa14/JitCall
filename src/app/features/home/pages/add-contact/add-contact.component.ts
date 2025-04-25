import { Component } from "@angular/core"
import { FormBuilder, Validators } from "@angular/forms"
import { ContactService } from "../../services/contact.service"
import { ToastController } from "@ionic/angular"
import { Router } from "@angular/router"

@Component({
  selector: "app-add-contact",
  templateUrl: "./add-contact.component.html",
  styleUrls: ["./add-contact.component.scss"],
  standalone: false,
})
export class AddContactComponent {
  form = this.fb.group({
    telefono: ['', [
      Validators.required,
      Validators.pattern(/^\d{10}$/)
    ]]
    ,
  })

  isSearching = false
  searchResult: any = null
  noResults = false

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private toast: ToastController,
    private router: Router,
  ) {}

  async onSubmit() {
    if (this.form.invalid) return

    const telefono = this.form.value.telefono
    if (!telefono) return

    this.isSearching = true
    this.searchResult = null
    this.noResults = false

    try {
      const result = await this.contactService.searchUserByPhone(telefono)

      if (!result) {
        this.noResults = true
        return
      }

      const currentUid = this.contactService.getCurrentUserId()
      if (result.uid === currentUid) {
        const t = await this.toast.create({
          message: "No puedes agregarte a ti mismo.",
          duration: 2000,
          color: "warning",
        })
        await t.present()
        return
      }

      this.searchResult = result.data
      this.searchResult.uid = result.uid
    } catch (error) {
      console.error("Error al buscar usuario:", error)
      const t = await this.toast.create({
        message: "Error al buscar usuario. Intenta nuevamente.",
        duration: 2000,
        color: "danger",
      })
      await t.present()
    } finally {
      this.isSearching = false
    }
  }

  async addContact(user: any) {
    try {
      await this.contactService.addContact({
        uid: user.uid,
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        fcmToken: user.fcmToken,
      })

      const t = await this.toast.create({
        message: "Contacto agregado exitosamente.",
        duration: 2000,
        color: "success",
      })
      await t.present()
      this.router.navigate(["/home"])
    } catch (error) {
      console.error("Error al agregar contacto:", error)
      const t = await this.toast.create({
        message: "Error al agregar contacto. Intenta nuevamente.",
        duration: 2000,
        color: "danger",
      })
      await t.present()
    }
  }

  getFullName(user: any): string {
    return `${user.nombre} ${user.apellido}`
  }

  goBack() {
    this.router.navigate(["/home"])
  }

  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  
}
