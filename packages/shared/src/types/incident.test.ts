import { describe, it, expect } from 'vitest'
import type { IIncident } from './incident'

describe('IIncident Interface', () => {
  it('should be structurally compatible with mock object', () => {
    const mockIncident: IIncident = {
      id: '123',
      incident_code: 'INC001',
      title: 'Test Incident',
      disaster_type: 'flood',
      status: 'reported',
      location: { type: 'Point', coordinates: [106.8, -6.2] },
      region: 'Jakarta',
      kecamatan: 'Central Jakarta',
      desa: 'Kelapa Gading',
      alamat_spesifik: 'Jl. Test No. 123',
      priority_score: 85,
      priority_level: 'high',
      description: 'Test description',
      kondisi_mutakhir: 'Under control',
      dampak_manusia: { injured: 5 },
      dampak_rumah: { damaged: 10 },
      dampak_fasum: { facilities: 2 },
      dampak_vital: { power: true },
      dampak_lingkungan: { pollution: false },
      needs_numeric: { food: 100 },
      has_shelter: true,
      is_ai_generated: false,
      reporter_name: 'John Doe',
      whatsapp_number: '081234567890',
      photo_data: 'base64encodedphoto',
      event_date: new Date(),
      probability_score: 75,
      ai_features: { prediction: 'likely' },
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    }
    
    // Verify all properties exist and have correct types
    expect(mockIncident.id).toBe('123')
    expect(mockIncident.incident_code).toBe('INC001')
    expect(mockIncident.title).toBe('Test Incident')
    expect(mockIncident.disaster_type).toBe('flood')
    expect(mockIncident.status).toBe('reported')
    expect(mockIncident.location).toEqual({ type: 'Point', coordinates: [106.8, -6.2] })
    expect(mockIncident.region).toBe('Jakarta')
    expect(mockIncident.kecamatan).toBe('Central Jakarta')
    expect(mockIncident.desa).toBe('Kelapa Gading')
    expect(mockIncident.alamat_spesifik).toBe('Jl. Test No. 123')
    expect(mockIncident.priority_score).toBe(85)
    expect(mockIncident.priority_level).toBe('high')
    expect(mockIncident.description).toBe('Test description')
    expect(mockIncident.kondisi_mutakhir).toBe('Under control')
    expect(mockIncident.dampak_manusia).toEqual({ injured: 5 })
    expect(mockIncident.dampak_rumah).toEqual({ damaged: 10 })
    expect(mockIncident.dampak_fasum).toEqual({ facilities: 2 })
    expect(mockIncident.dampak_vital).toEqual({ power: true })
    expect(mockIncident.dampak_lingkungan).toEqual({ pollution: false })
    expect(mockIncident.needs_numeric).toEqual({ food: 100 })
    expect(mockIncident.has_shelter).toBe(true)
    expect(mockIncident.is_ai_generated).toBe(false)
    expect(mockIncident.reporter_name).toBe('John Doe')
    expect(mockIncident.whatsapp_number).toBe('081234567890')
    expect(mockIncident.photo_data).toBe('base64encodedphoto')
    expect(mockIncident.event_date).toBeInstanceOf(Date)
    expect(mockIncident.probability_score).toBe(75)
    expect(mockIncident.ai_features).toEqual({ prediction: 'likely' })
    expect(mockIncident.created_at).toBeInstanceOf(Date)
    expect(mockIncident.updated_at).toBeInstanceOf(Date)
    expect(mockIncident.deleted_at).toBeNull()
  })
})