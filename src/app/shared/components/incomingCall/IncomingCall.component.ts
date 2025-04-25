import { Component, Input,  OnInit, OnDestroy } from "@angular/core"
import { ModalController } from "@ionic/angular"
import { CallHistoryService } from "src/app/features/call/services/call-history.service"

@Component({
  selector: "app-incoming-call",
  templateUrl: "./incomingCall.component.html",
  styleUrls: ["./incomingCall.component.scss"],
  standalone: false,
})
export class IncomingCallComponent implements OnInit, OnDestroy {
  @Input() userFrom!: string
  @Input() name!: string
  @Input() meetingId!: string
  @Input() callId?: string

  callTimer = "00:00"
  private timerInterval: any
  private seconds = 0

  constructor(
    private modalCtrl: ModalController,
    private callHistoryService: CallHistoryService,
  ) {}

  ngOnInit() {
    this.startTimer()

    // Si no hay callId registrar la llamada entrante
    if (!this.callId && this.userFrom && this.name && this.meetingId) {
      this.registerIncomingCall()
    }
  }

  async registerIncomingCall() {
    try {
      const newCallId = await this.callHistoryService.logIncomingCall(this.userFrom, this.name, this.meetingId)
      if (newCallId) {
        this.callId = newCallId
      }
    } catch (error) {
      console.error("Error al registrar llamada entrante:", error)
    }
  }

  ngOnDestroy() {
    this.clearTimer()
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.seconds++
      const minutes = Math.floor(this.seconds / 60)
      const remainingSeconds = this.seconds % 60
      this.callTimer = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }, 1000)
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
  }

  getInitials(fullName: string): string {
    if (!fullName) return ""

    const parts = fullName.split(" ")
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return fullName.charAt(0).toUpperCase()
  }

  async dismiss() {
    this.clearTimer()

    // Actualizar el estado de la llamada a 'rejected'
    if (this.callId) {
      await this.callHistoryService.updateCallStatus(this.callId, "rejected")
    }

    this.modalCtrl.dismiss({
      accepted: false,
      callId: this.callId,
    })
  }

  async answerCall() {
    this.clearTimer()

    // Actualizar el estado de la llamada a 'answered'
    if (this.callId) {
      await this.callHistoryService.updateCallStatus(this.callId, "answered")
    }

    this.modalCtrl.dismiss({
      accepted: true,
      meetingId: this.meetingId,
      callId: this.callId,
    })
  }
}
