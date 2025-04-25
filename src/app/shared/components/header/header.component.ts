import { Component, Input, Output, EventEmitter } from "@angular/core"

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  standalone: false,
})
export class HeaderComponent {
  @Input() title = "JitCall"
  @Input() showBackButton = false
  @Input() showLogo = true
  @Input() transparent = false
  @Input() showLogout = false
  @Input() showSettings = false
  @Input() showAddContact = false

  @Output() onBack = new EventEmitter<void>()
  @Output() onLogout = new EventEmitter<void>()
  @Output() onSettings = new EventEmitter<void>()
  @Output() onAddContact = new EventEmitter<void>()

  goBack() {
    this.onBack.emit()
  }

  logout() {
    this.onLogout.emit()
  }

  settings() {
    this.onSettings.emit()
  }

  addContact() {
    this.onAddContact.emit()
  }
}
