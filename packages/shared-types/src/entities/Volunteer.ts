import type { BaseEntity } from '../common/entity'
import type { ISODateString } from '../types/DateTypes'
import type { VolunteerStatus, VolunteerType, SkillType } from '../enums'

export interface Volunteer extends BaseEntity {
  userId: string
  name: string
  email: string
  phone: string
  type: VolunteerType
  status: VolunteerStatus
  skills: SkillType[]
  organization: string
  province?: string
  regency?: string
  district?: string
  photo?: string
  idCardNumber?: string
  joinedAt: ISODateString
  lastActiveAt?: ISODateString
  totalMissions: number
  totalHours: number
}

export interface Team extends BaseEntity {
  name: string
  code: string
  type: string
  status: string
  leaderId: string
  leaderName?: string
  deputyLeaderId?: string
  description?: string
  memberCount: number
}

export interface TeamMember extends BaseEntity {
  teamId: string
  userId: string
  name: string
  role: string
  joinedAt: ISODateString
}

export interface Assignment extends BaseEntity {
  volunteerId: string
  incidentId: string
  missionId?: string
  type: string
  status: string
  startAt: ISODateString
  endAt?: ISODateString
  notes?: string
}

export interface CheckIn extends BaseEntity {
  volunteerId: string
  incidentId: string
  location?: string
  timestamp: ISODateString
  type: string
  notes?: string
}
