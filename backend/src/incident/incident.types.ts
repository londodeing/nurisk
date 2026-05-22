export type IncidentStatus = 'REPORTED' | 'VERIFIED' | 'ASSESSED' | 'COMMANDED' | 'ACTION' | 'COMPLETED' | 'REJECTED' | 'DISMISSED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DisasterType = 'FLOOD' | 'EARTHQUAKE' | 'FIRE' | 'LANDSLIDE' | 'OTHER';

export interface IncidentFilter {
  status?: IncidentStatus;
  severity?: PriorityLevel;
  type?: DisasterType;
  province?: string;
  regency?: string;
  district?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IncidentStatistics {
  total: number;
  active: number;
  critical: number;
  verified: number;
  completed: number;
}

export interface IncidentTimelineEvent {
  id: string;
  incidentId: string;
  type: string;
  description: string;
  createdAt: Date;
}