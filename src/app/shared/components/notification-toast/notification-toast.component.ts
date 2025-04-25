import { Component, Input, type OnInit } from "@angular/core"
import { AnimationController } from "@ionic/angular"

@Component({
  selector: "app-notification-toast",
  templateUrl: "./notification-toast.component.html",
  styleUrls: ["./notification-toast.component.scss"],
  standalone: false,
})
export class NotificationToastComponent implements OnInit {
  @Input() title = ""
  @Input() message = ""
  @Input() icon = "checkmark-circle-outline"
  @Input() color = "primary"
  @Input() duration = 3000
  @Input() position: "top" | "bottom" = "top"

  isVisible = false

  constructor(private animationCtrl: AnimationController) {}

  ngOnInit() {
    this.show()
  }

  show() {
    this.isVisible = true

    // Auto-hide after duration
    setTimeout(() => {
      this.hide()
    }, this.duration)
  }

  hide() {
    this.isVisible = false
  }
}
