import type { BaseEntity } from '../common/entity'
import type { GeoLocation } from '../types/Geolocation'
import type { ISODateString } from '../types/DateTypes'
import type { MessageType, MessageStatus } from '../enums'

export interface Message extends BaseEntity {
  conversationId: string
  senderId: string
  senderName?: string
  senderAvatar?: string
  type: MessageType
  /** Message content (canonical - matches backend Prisma) */
  message: string
  mediaUrl?: string
  thumbnail?: string
  fileName?: string
  fileSize?: number
  location?: GeoLocation
  replyTo?: string
  status: MessageStatus
  readAt?: ISODateString
}
