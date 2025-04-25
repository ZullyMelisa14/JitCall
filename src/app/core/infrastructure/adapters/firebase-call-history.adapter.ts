import { Injectable } from "@angular/core"
import { Auth } from "@angular/fire/auth"
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "@angular/fire/firestore"
import { map } from "rxjs/operators"
import { Observable } from "rxjs"
import { CallHistoryEntity } from "../../domain/entities/call-history.entity"
import { CallHistoryRepository } from "../../domain/repositories/call-history.repository"

@Injectable({
  providedIn: "root",
})
export class FirebaseCallHistoryAdapter implements CallHistoryRepository {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  getCallHistory(): Observable<CallHistoryEntity[]> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const callHistoryRef = collection(this.firestore, `users/${uid}/call-history`)
    const q = query(callHistoryRef, orderBy("timestamp", "desc"))

    return collectionData(q, { idField: "id" }).pipe(
      map(
        (calls) =>
          calls.map((call) => ({
            ...call,
            timestamp: this.convertTimestampToDate(call["timestamp"]),
          })) as CallHistoryEntity[],
      ),
    )
  }

  async addCallRecord(callRecord: CallHistoryEntity): Promise<void> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const callHistoryRef = collection(this.firestore, `users/${uid}/call-history`)
    await addDoc(callHistoryRef, {
      ...callRecord,
      timestamp: serverTimestamp(),
    })
  }

  async updateCallRecord(callId: string, data: Partial<CallHistoryEntity>): Promise<void> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const callRecordRef = doc(this.firestore, `users/${uid}/call-history/${callId}`)
    await updateDoc(callRecordRef, { ...data })
  }

  async deleteCallRecord(callId: string): Promise<void> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const callRecordRef = doc(this.firestore, `users/${uid}/call-history/${callId}`)
    await deleteDoc(callRecordRef)
  }

  private convertTimestampToDate(timestamp: any): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate()
    } else if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000)
    }
    return new Date()
  }
}
