export const INCIDENT_STATUS = [
  'REPORTED',
  'VERIFIED',
  'ASSESSMENT',
  'COMMANDED',
  'ACTION',
  'COMPLETED',
  'REJECTED',
  'ASSESSED',
] as const;

export const INCIDENT_SEVERITY = [
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
] as const;

export const DISASTER_TYPE = [
  'BANJIR',
  'TANAH_LONGSOR',
  'GEMPA_BUMI',
  'TSUNAMI',
  'GUNUNG_MERETUS',
  'KEBAKARAN_HUTAN',
  'CUACA_EKSTREM',
  'KEKERINGAN',
  'GELOMBANG_PASANG',
  'KONFLIK_SOSIAL',
  'KEBAKARAN',
] as const;

export const INCIDENT_SOURCE = [
  'sensor',
  'manual_report',
  'social_media',
  'emergency_call',
  'other'
] as const;