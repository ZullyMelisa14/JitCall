import { Injectable } from "@angular/core"
import { Auth } from "@angular/fire/auth"
import { Firestore } from "@angular/fire/firestore"
import { Observable } from "rxjs"
import { CallHistoryRepository } from "../../domain/repositories/call-history.repository"
import { CallHistoryEntity } from "../../domain/entities/call-history.entity"
import { FirebaseCallHistoryAdapter } from "../adapters/firebase-call-history.adapter"

@Injectable({
  providedIn: "root",
})
export class CallHistoryRepositoryImpl implements CallHistoryRepository {
  private adapter: FirebaseCallHistoryAdapter

  constructor(
    private auth: Auth,
    private firestore: Firestore,
  ) {
    this.adapter = new FirebaseCallHistoryAdapter(firestore, auth)
  }

  getCallHistory(): Observable<CallHistoryEntity[]> {
    return this.adapter.getCallHistory()
  }

  async addCallRecord(callRecord: CallHistoryEntity): Promise<void> {
    return this.adapter.addCallRecord(callRecord)
  }

  async updateCallRecord(callId: string, data: Partial<CallHistoryEntity>): Promise<void> {
    return this.adapter.updateCallRecord(callId, data)
  }

  async deleteCallRecord(callId: string): Promise<void> {
    return this.adapter.deleteCallRecord(callId)
  }
}
