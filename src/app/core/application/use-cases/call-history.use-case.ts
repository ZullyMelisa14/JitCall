import { Inject, Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { CallHistoryEntity } from "../../domain/entities/call-history.entity"
import { CallHistoryRepository } from "../../domain/repositories/call-history.repository"
import { CALL_HISTORY_REPOSITORY } from "../../domain/tokens/injection-tokens"

@Injectable({
  providedIn: "root",
})
export class CallHistoryUseCase {
  constructor(
    @Inject(CALL_HISTORY_REPOSITORY) private callHistoryRepository: CallHistoryRepository,
  ) {}

  getCallHistory(): Observable<CallHistoryEntity[]> {
    return this.callHistoryRepository.getCallHistory()
  }

  async addCallRecord(callRecord: CallHistoryEntity): Promise<void> {
    return this.callHistoryRepository.addCallRecord(callRecord)
  }

  async updateCallRecord(callId: string, data: Partial<CallHistoryEntity>): Promise<void> {
    return this.callHistoryRepository.updateCallRecord(callId, data)
  }

  async deleteCallRecord(callId: string): Promise<void> {
    return this.callHistoryRepository.deleteCallRecord(callId)
  }

  async logOutgoingCall(contactId: string, contactName: string, meetingId: string): Promise<string | undefined> {
    const callRecord: CallHistoryEntity = {
      contactId,
      contactName,
      timestamp: new Date(),
      duration: 0,
      type: "outgoing",
      status: "missed", // Inicialmente missed, se actualizará si contestan
      meetingId,
    }

    try {
      await this.callHistoryRepository.addCallRecord(callRecord)
      // El ID se generará al agregar el documento
      return undefined // El ID se obtendría al suscribirse al historial
    } catch (error) {
      console.error("Error al registrar llamada saliente:", error)
      return undefined
    }
  }

  async logIncomingCall(contactId: string, contactName: string, meetingId: string): Promise<string | undefined> {
    const callRecord: CallHistoryEntity = {
      contactId,
      contactName,
      timestamp: new Date(),
      duration: 0,
      type: "incoming",
      status: "missed", // Inicialmente missed, se actualizará si contestan
      meetingId,
    }

    try {
      await this.callHistoryRepository.addCallRecord(callRecord)
      return undefined
    } catch (error) {
      console.error("Error al registrar llamada entrante:", error)
      return undefined
    }
  }

  async updateCallStatus(callId: string, status: "answered" | "rejected" | "missed", duration = 0): Promise<void> {
    try {
      await this.callHistoryRepository.updateCallRecord(callId, {
        status,
        duration,
      })
    } catch (error) {
      console.error("Error al actualizar estado de llamada:", error)
    }
  }
}
