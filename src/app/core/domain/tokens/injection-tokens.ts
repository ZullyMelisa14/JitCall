import { InjectionToken } from "@angular/core"
import { AuthRepository } from "../repositories/auth.repository"
import { ContactRepository } from "../repositories/contact.repository"
import { NotificationRepository } from "../repositories/notification.repository"
import { CallHistoryRepository } from "../repositories/call-history.repository"

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>("AuthRepository")
export const CONTACT_REPOSITORY = new InjectionToken<ContactRepository>("ContactRepository")
export const NOTIFICATION_REPOSITORY = new InjectionToken<NotificationRepository>("NotificationRepository")
export const CALL_HISTORY_REPOSITORY = new InjectionToken<CallHistoryRepository>("CallHistoryRepository")
