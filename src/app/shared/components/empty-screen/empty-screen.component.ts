import { Component, Input } from "@angular/core"

@Component({
  selector: "app-empty-screen",
  templateUrl: "./empty-screen.component.html",
  styleUrls: ["./empty-screen.component.scss"],
  standalone: false,
})
export class EmptyScreenComponent {
  @Input() icon = "alert-circle-outline"
  @Input() title = "No hay datos"
  @Input() message = "No se encontraron elementos para mostrar."
  @Input() showButton = false
  @Input() buttonText = "Acción"
  @Input() buttonIcon = ""
}
