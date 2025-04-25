import { Component, EventEmitter, Input, Output } from "@angular/core"
import { CallHistoryEntity } from "src/app/core/domain/entities/call-history.entity"

@Component({
  selector: "app-call-history-item",
  templateUrl: "./call-history.component.html",
  styleUrls: ["./call-history.component.scss"],
  standalone: false,
})
export class CallHistoryComponent {
  @Input() call!: CallHistoryEntity
  @Output() deleteCall = new EventEmitter<string>()
  @Output() callContact = new EventEmitter<CallHistoryEntity>()

  getFormattedDuration(): string {
    const minutes = Math.floor(this.call.duration / 60)
    const seconds = this.call.duration % 60
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  getFormattedTime(): string {
    const callDate = this.call.timestamp instanceof Date ? this.call.timestamp : new Date(this.call.timestamp)
    return callDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  getFormattedDate(): string {
    const callDate = this.call.timestamp instanceof Date ? this.call.timestamp : new Date(this.call.timestamp)

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (callDate.toDateString() === today.toDateString()) {
      return "Hoy"
    } else if (callDate.toDateString() === yesterday.toDateString()) {
      return "Ayer"
    } else {
      return callDate.toLocaleDateString()
    }
  }

  getStatusIcon(): string {
    if (this.call.type === "incoming") {
      return this.call.status === "answered" ? "call-outline" : "call-outline"
    } else {
      return "call-outline"
    }
  }

  getStatusClass(): string {
    if (this.call.status === "missed" || this.call.status === "rejected") {
      return "missed"
    } else if (this.call.type === "incoming") {
      return "incoming"
    } else {
      return "outgoing"
    }
  }

  onDeleteCall() {
    if (this.call.id) {
      this.deleteCall.emit(this.call.id)
    }
  }

  onCallContact() {
    this.callContact.emit(this.call)
  }
}
