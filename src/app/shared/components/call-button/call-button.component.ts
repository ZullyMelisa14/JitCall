import { Component, Input, Output, EventEmitter } from "@angular/core"

@Component({
  selector: "app-call-button",
  templateUrl: "./call-button.component.html",
  styleUrls: ["./call-button.component.scss"],
  standalone: false,
})
export class CallButtonComponent {
  @Input() type: "call" | "answer" | "reject" = "call"
  @Input() size: "small" | "medium" | "large" = "medium"
  @Output() buttonClick = new EventEmitter<void>()

  onClick() {
    this.buttonClick.emit()
  }
}
