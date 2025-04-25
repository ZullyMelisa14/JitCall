import { Observable } from "rxjs"
import { CallHistoryEntity } from "../entities/call-history.entity"

export interface CallHistoryRepository {
  getCallHistory(): Observable<CallHistoryEntity[]>
  addCallRecord(callRecord: CallHistoryEntity): Promise<void>
  updateCallRecord(callId: string, data: Partial<CallHistoryEntity>): Promise<void>
  deleteCallRecord(callId: string): Promise<void>
}
