import { Injectable, NgZone } from "@angular/core"
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, } from "@angular/fire/auth"
import { Firestore, doc, setDoc, getDoc } from "@angular/fire/firestore"
import { AuthRepository } from "../../domain/repositories/auth.repository"
import { UserEntity } from "../../domain/entities/user.entity"

@Injectable({
  providedIn: "root",
})
export class FirebaseAuthAdapter implements AuthRepository {
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private ngZone: NgZone
  ) {}

  async login(email: string, password: string): Promise<string> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      await this.saveFcmToken(userCredential.user.uid);
      return userCredential.user.uid;
    } catch (error) {
      console.error("Error en login: ", error);
      throw error;
    }
  }

  async register(user: UserEntity, password: string): Promise<string> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, user.email, password)
      const uid = userCredential.user.uid
  
      await setDoc(doc(this.firestore, `users/${uid}`), {
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        email: user.email,
      })
  
      await this.saveFcmToken(uid)
      return uid
    } catch (error) {
      console.error("Error en register: ", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth)
    } catch (error) {
      console.error("Error al cerrar sesion:", error);
    }
  }

  async getCurrentUser(): Promise<UserEntity | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, async (user) => {
        this.ngZone.run(async () => {
          if (user) {
            try {
              const userDoc = await getDoc(doc(this.firestore, `users/${user.uid}`));
              if (userDoc.exists()) {
                const userData = userDoc.data() as UserEntity;
                resolve({
                  ...userData,
                  uid: user.uid,
                })
              } else {
                resolve({
                  uid: user.uid,
                  email: user.email || "",
                  nombre: "",
                  apellido: "",
                  telefono: "",
                });
              }
            } catch (error) {
              console.error("Error al obtener datos del usuario: ", error);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        });
      });
    });
  }

  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  async saveFcmToken(uid: string, token?: string): Promise<void> {
    // En web, podemos usar un token simulado o uno real si está disponible
    const fcmToken = token || "web-token-" + new Date().getTime()

    try {
      await setDoc(
        doc(this.firestore, `users/${uid}`),
        {
          fcmToken: fcmToken,
        },
        { merge: true },
      )
      console.log("✅ Token FCM guardado en Firestore:", fcmToken)
    } catch (error) {
      console.error("❌ Error al guardar el token FCM:", error)
    }
  }
}
