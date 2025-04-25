export interface CallHistoryEntity {
  id?: string
  contactId: string
  contactName: string
  timestamp: Date
  duration: number
  type: "incoming" | "outgoing" | "missed"
  status: "answered" | "rejected" | "missed"
  meetingId: string
}
