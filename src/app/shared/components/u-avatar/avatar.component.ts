import { Component, Input } from "@angular/core"

@Component({
  selector: "app-user-avatar",
  templateUrl: "./avatar.component.html",
  styleUrls: ["./avatar.component.scss"],
  standalone: false,
})
export class UAvatarComponent {
  @Input() name = ""
  @Input() size: "small" | "medium" | "large" = "medium"
  @Input() customClass = ""

  getInitials(): string {
    if (!this.name) return ""

    const parts = this.name.split(" ")
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return this.name.charAt(0).toUpperCase()
  }
}
