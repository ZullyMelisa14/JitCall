import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { CallHistoryEntity } from "src/app/core/domain/entities/call-history.entity"
import { CallHistoryUseCase } from "src/app/core/application/use-cases/call-history.use-case"

@Injectable({
  providedIn: "root",
})
export class CallHistoryService {
  constructor(private callHistoryUseCase: CallHistoryUseCase) {}

  getCallHistory(): Observable<CallHistoryEntity[]> {
    return this.callHistoryUseCase.getCallHistory()
  }

  async logOutgoingCall(contactId: string, contactName: string, meetingId: string): Promise<string | undefined> {
    return this.callHistoryUseCase.logOutgoingCall(contactId, contactName, meetingId)
  }

  async logIncomingCall(contactId: string, contactName: string, meetingId: string): Promise<string | undefined> {
    return this.callHistoryUseCase.logIncomingCall(contactId, contactName, meetingId)
  }

  async updateCallStatus(callId: string, status: "answered" | "rejected" | "missed", duration = 0): Promise<void> {
    return this.callHistoryUseCase.updateCallStatus(callId, status, duration)
  }

  async deleteCallRecord(callId: string): Promise<void> {
    return this.callHistoryUseCase.deleteCallRecord(callId)
  }
}
