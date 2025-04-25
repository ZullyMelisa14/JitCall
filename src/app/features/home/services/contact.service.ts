import { collection, collectionData, doc, getDoc, setDoc, deleteDoc, updateDoc } from "@angular/fire/firestore"
import { Auth } from "@angular/fire/auth"
import { Firestore } from "@angular/fire/firestore"
import { Injectable } from "@angular/core"
import { Observable } from "rxjs"
import { getDocs, query, where, collection as fCollection } from "firebase/firestore"
import { ContactEntity } from "src/app/core/domain/entities/user.entity"

@Injectable({
  providedIn: "root",
})
export class ContactService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  getContacts(): Observable<ContactEntity[]> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const contactsRef = collection(this.firestore, `users/${uid}/contacts`)
    return collectionData(contactsRef, { idField: "uid" }) as Observable<ContactEntity[]>
  }

  async getContactDataById(uid: string): Promise<any | null> {
    const contactRef = doc(this.firestore, `users/${uid}`)
    const snapshot = await getDoc(contactRef)
    return snapshot.exists() ? { ...snapshot.data(), uid: snapshot.id } : null
  }

  async getContactById(contactId: string): Promise<ContactEntity | null> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const contactRef = doc(this.firestore, `users/${uid}/contacts/${contactId}`)
    const snapshot = await getDoc(contactRef)
    return snapshot.exists() ? ({ ...snapshot.data(), uid: snapshot.id } as ContactEntity) : null
  }

  async searchUserByPhone(telefono: string): Promise<{ uid: string; data: any } | null> {
    const usersRef = fCollection(this.firestore, "users")
    const q = query(usersRef, where("telefono", "==", telefono))
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    const docSnap = snapshot.docs[0]
    return { uid: docSnap.id, data: { ...docSnap.data(), uid: docSnap.id } }
  }

  async addContact(contacto: ContactEntity): Promise<void> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const contactRef = doc(this.firestore, `users/${uid}/contacts/${contacto.uid}`)
    await setDoc(contactRef, contacto)
  }

  async updateContactPhone(contactId: string, newPhone: string): Promise<void> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const contactRef = doc(this.firestore, `users/${uid}/contacts/${contactId}`)
    await updateDoc(contactRef, { telefono: newPhone })
  }

  async deleteContact(contactId: string): Promise<void> {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")

    const contactRef = doc(this.firestore, `users/${uid}/contacts/${contactId}`)
    await deleteDoc(contactRef)
  }

  getCurrentUserId(): string {
    const uid = this.auth.currentUser?.uid
    if (!uid) throw new Error("Usuario no autenticado")
    return uid
  }
}
