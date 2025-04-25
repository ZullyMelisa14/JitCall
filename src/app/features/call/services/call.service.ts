import { Injectable } from "@angular/core"
import { CallUseCase } from "../../../core/application/use-cases/call.use-case"
import { ContactEntity } from "../../../core/domain/entities/user.entity"
import { CallHistoryService } from "./call-history.service"

@Injectable({
  providedIn: "root",
})
export class CallService {
  constructor(
    private callUseCase: CallUseCase,
    private callHistoryService: CallHistoryService,
  ) {}

  async initiateCall(contact: ContactEntity): Promise<string | null> {
    const meetingId = await this.callUseCase.initiateCall(contact)

    if (meetingId) {
      // Registrar la llamada saliente en el historial
      await this.callHistoryService.logOutgoingCall(contact.uid, `${contact.nombre} ${contact.apellido}`, meetingId)
    }

    return meetingId
  }

  getJitsiMeetUrl(meetingId: string): string {
    return this.callUseCase.getJitsiMeetUrl(meetingId)
  }

  async joinJitsiMeeting(meetingId: string, callId?: string): Promise<void> {
    if (callId) {
      // Actualizar el estado de la llamada a 'answered'
      await this.callHistoryService.updateCallStatus(callId, "answered")
    }

    return this.callUseCase.joinJitsiMeeting(meetingId)
  }

  async rejectCall(callId?: string): Promise<void> {
    if (callId) {
      // Actualizar el estado de la llamada a 'rejected'
      await this.callHistoryService.updateCallStatus(callId, "rejected")
    }
  }

  // Para actualizar la duración cuando termina una llamada
  async endCall(callId: string, duration: number): Promise<void> {
    await this.callHistoryService.updateCallStatus(callId, "answered", duration)
  }
}
