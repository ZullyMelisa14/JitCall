import { Component, Input, Output, EventEmitter } from "@angular/core"
import { ContactEntity } from "src/app/core/domain/entities/user.entity"

@Component({
  selector: "app-contact",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"],
  standalone: false,
})
export class CCardComponent {
  @Output() callContact = new EventEmitter<ContactEntity>()
  @Output() viewProfile = new EventEmitter<ContactEntity>()
  @Input() contact!: ContactEntity
  @Input() isOnline = false

  onCall() {
    this.callContact.emit(this.contact)
  }

  getFullName(): string {
    return `${this.contact.nombre} ${this.contact.apellido}`
  }
  onViewProfile() {
    this.viewProfile.emit(this.contact)
  }
}
