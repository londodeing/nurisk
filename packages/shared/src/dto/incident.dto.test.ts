import { describe, it, expect } from 'vitest'
import { CreateIncidentDTO, UpdateIncidentDTO, IncidentResponseDTO } from './incident.dto'

describe('Incident DTOs', () => {
  describe('CreateIncidentDTO', () => {
    it('should create instance with default values', () => {
      const dto = new CreateIncidentDTO()
      // Check that all required properties exist
      expect(dto).toHaveProperty('incident_code')
      expect(dto).toHaveProperty('title')
      expect(dto).toHaveProperty('disaster_type')
      expect(dto).toHaveProperty('status')
      expect(dto).toHaveProperty('location')
      expect(dto).toHaveProperty('region')
      expect(dto).toHaveProperty('kecamatan')
      expect(dto).toHaveProperty('desa')
      expect(dto).toHaveProperty('alamat_spesifik')
      expect(dto).toHaveProperty('reporter_name')
      expect(dto).toHaveProperty('whatsapp_number')
      expect(dto).toHaveProperty('event_date')
      
      // Check default values (should be undefined or empty strings)
      expect(dto.incident_code).toBeUndefined()
      expect(dto.title).toBeUndefined()
      expect(dto.disaster_type).toBeUndefined()
      expect(dto.status).toBeUndefined()
      expect(dto.location).toBeUndefined()
      expect(dto.region).toBeUndefined()
      expect(dto.kecamatan).toBeUndefined()
      expect(dto.desa).toBeUndefined()
      expect(dto.alamat_spesifik).toBeUndefined()
      expect(dto.priority_score).toBeUndefined()
      expect(dto.priority_level).toBeUndefined()
      expect(dto.description).toBeUndefined()
      expect(dto.kondisi_mutakhir).toBeUndefined()
      expect(dto.dampak_manusia).toBeUndefined()
      expect(dto.dampak_rumah).toBeUndefined()
      expect(dto.dampak_fasum).toBeUndefined()
      expect(dto.dampak_vital).toBeUndefined()
      expect(dto.dampak_lingkungan).toBeUndefined()
      expect(dto.needs_numeric).toBeUndefined()
      expect(dto.has_shelter).toBeUndefined()
      expect(dto.reporter_name).toBeUndefined()
      expect(dto.whatsapp_number).toBeUndefined()
      expect(dto.photo_data).toBeUndefined()
      expect(dto.event_date).toBeUndefined()
      expect(dto.probability_score).toBeUndefined()
      expect(dto.ai_features).toBeUndefined()
    })
    
    it('should set values correctly', () => {
      const dto = new CreateIncidentDTO()
      const testDate = new Date()
      
      dto.incident_code = 'INC001'
      dto.title = 'Test Incident'
      dto.disaster_type = 'flood'
      dto.status = 'reported'
      dto.location = { type: 'Point', coordinates: [106.8, -6.2] }
      dto.region = 'Jakarta'
      dto.kecamatan = 'Central Jakarta'
      dto.desa = 'Kelapa Gading'
      dto.alamat_spesifik = 'Jl. Test No. 123'
      dto.priority_score = 85
      dto.priority_level = 'high'
      dto.description = 'Test description'
      dto.kondisi_mutakhir = 'Under control'
      dto.dampak_manusia = { injured: 5 }
      dto.dampak_rumah = { damaged: 10 }
      dto.dampak_fasum = { facilities: 2 }
      dto.dampak_vital = { power: true }
      dto.dampak_lingkungan = { pollution: false }
      dto.needs_numeric = { food: 100 }
      dto.has_shelter = true
      dto.reporter_name = 'John Doe'
      dto.whatsapp_number = '081234567890'
      dto.photo_data = 'base64encodedphoto'
      dto.event_date = testDate
      dto.probability_score = 75
      dto.ai_features = { prediction: 'likely' }
      
      expect(dto.incident_code).toBe('INC001')
      expect(dto.title).toBe('Test Incident')
      expect(dto.disaster_type).toBe('flood')
      expect(dto.status).toBe('reported')
      expect(dto.location).toEqual({ type: 'Point', coordinates: [106.8, -6.2] })
      expect(dto.region).toBe('Jakarta')
      expect(dto.kecamatan).toBe('Central Jakarta')
      expect(dto.desa).toBe('Kelapa Gading')
      expect(dto.alamat_spesifik).toBe('Jl. Test No. 123')
      expect(dto.priority_score).toBe(85)
      expect(dto.priority_level).toBe('high')
      expect(dto.description).toBe('Test description')
      expect(dto.kondisi_mutakhir).toBe('Under control')
      expect(dto.dampak_manusia).toEqual({ injured: 5 })
      expect(dto.dampak_rumah).toEqual({ damaged: 10 })
      expect(dto.dampak_fasum).toEqual({ facilities: 2 })
      expect(dto.dampak_vital).toEqual({ power: true })
      expect(dto.dampak_lingkungan).toEqual({ pollution: false })
      expect(dto.needs_numeric).toEqual({ food: 100 })
      expect(dto.has_shelter).toBe(true)
      expect(dto.reporter_name).toBe('John Doe')
      expect(dto.whatsapp_number).toBe('081234567890')
      expect(dto.photo_data).toBe('base64encodedphoto')
      expect(dto.event_date).toBe(testDate)
      expect(dto.probability_score).toBe(75)
      expect(dto.ai_features).toEqual({ prediction: 'likely' })
    })
  })
  
  describe('UpdateIncidentDTO', () => {
    it('should create instance with default values', () => {
      const dto = new UpdateIncidentDTO()
      // id is required but will be undefined by default
      expect(dto).toHaveProperty('id')
      expect(dto.id).toBeUndefined()
      
      // All other fields should be optional and undefined
      expect(dto.incident_code).toBeUndefined()
      expect(dto.title).toBeUndefined()
      expect(dto.disaster_type).toBeUndefined()
      expect(dto.status).toBeUndefined()
      expect(dto.location).toBeUndefined()
      expect(dto.region).toBeUndefined()
      expect(dto.kecamatan).toBeUndefined()
      expect(dto.desa).toBeUndefined()
      expect(dto.alamat_spesifik).toBeUndefined()
      expect(dto.priority_score).toBeUndefined()
      expect(dto.priority_level).toBeUndefined()
      expect(dto.description).toBeUndefined()
      expect(dto.kondisi_mutakhir).toBeUndefined()
      expect(dto.dampak_manusia).toBeUndefined()
      expect(dto.dampak_rumah).toBeUndefined()
      expect(dto.dampak_fasum).toBeUndefined()
      expect(dto.dampak_vital).toBeUndefined()
      expect(dto.dampak_lingkungan).toBeUndefined()
      expect(dto.needs_numeric).toBeUndefined()
      expect(dto.has_shelter).toBeUndefined()
      expect(dto.is_ai_generated).toBeUndefined()
      expect(dto.reporter_name).toBeUndefined()
      expect(dto.whatsapp_number).toBeUndefined()
      expect(dto.photo_data).toBeUndefined()
      expect(dto.event_date).toBeUndefined()
      expect(dto.probability_score).toBeUndefined()
      expect(dto.ai_features).toBeUndefined()
    })
    
    it('should set values correctly', () => {
      const dto = new UpdateIncidentDTO()
      const testDate = new Date()
      
      dto.id = '123'
      dto.incident_code = 'INC001-UPD'
      dto.title = 'Updated Incident'
      dto.disaster_type = 'earthquake'
      dto.status = 'in_progress'
      dto.location = { type: 'Point', coordinates: [106.9, -6.1] }
      dto.region = 'Bandung'
      dto.kecamatan = 'Coblong'
      dto.desa = 'Cikapundung'
      dto.alamat_spesifik = 'Jl. Update No. 456'
      dto.priority_score = 60
      dto.priority_level = 'medium'
      dto.description = 'Updated description'
      dto.kondisi_mutakhir = 'Being monitored'
      dto.dampak_manusia = { injured: 2 }
      dto.dampak_rumah = { damaged: 5 }
      dto.dampak_fasum = { facilities: 1 }
      dto.dampak_vital = { water: false }
      dto.dampak_lingkungan = { landslide: true }
      dto.needs_numeric = { medicine: 50 }
      dto.has_shelter = false
      dto.is_ai_generated = true
      dto.reporter_name = 'Jane Smith'
      dto.whatsapp_number = '089876543210'
      dto.photo_data = 'base64updatedphoto'
      dto.event_date = testDate
      dto.probability_score = 45
      dto.ai_features = { prediction: 'unlikely' }
      
      expect(dto.id).toBe('123')
      expect(dto.incident_code).toBe('INC001-UPD')
      expect(dto.title).toBe('Updated Incident')
      expect(dto.disaster_type).toBe('earthquake')
      expect(dto.status).toBe('in_progress')
      expect(dto.location).toEqual({ type: 'Point', coordinates: [106.9, -6.1] })
      expect(dto.region).toBe('Bandung')
      expect(dto.kecamatan).toBe('Coblong')
      expect(dto.desa).toBe('Cikapundung')
      expect(dto.alamat_spesifik).toBe('Jl. Update No. 456')
      expect(dto.priority_score).toBe(60)
      expect(dto.priority_level).toBe('medium')
      expect(dto.description).toBe('Updated description')
      expect(dto.kondisi_mutakhir).toBe('Being monitored')
      expect(dto.dampak_manusia).toEqual({ injured: 2 })
      expect(dto.dampak_rumah).toEqual({ damaged: 5 })
      expect(dto.dampak_fasum).toEqual({ facilities: 1 })
      expect(dto.dampak_vital).toEqual({ water: false })
      expect(dto.dampak_lingkungan).toEqual({ landslide: true })
      expect(dto.needs_numeric).toEqual({ medicine: 50 })
      expect(dto.has_shelter).toBe(false)
      expect(dto.is_ai_generated).toBe(true)
      expect(dto.reporter_name).toBe('Jane Smith')
      expect(dto.whatsapp_number).toBe('089876543210')
      expect(dto.photo_data).toBe('base64updatedphoto')
      expect(dto.event_date).toBe(testDate)
      expect(dto.probability_score).toBe(45)
      expect(dto.ai_features).toEqual({ prediction: 'unlikely' })
    })
  })
  
  describe('IncidentResponseDTO', () => {
    it('should create instance with default values', () => {
      const dto = new IncidentResponseDTO()
      // Check that all properties exist
      expect(dto).toHaveProperty('id')
      expect(dto).toHaveProperty('incident_code')
      expect(dto).toHaveProperty('title')
      expect(dto).toHaveProperty('disaster_type')
      expect(dto).toHaveProperty('status')
      expect(dto).toHaveProperty('location')
      expect(dto).toHaveProperty('region')
      expect(dto).toHaveProperty('kecamatan')
      expect(dto).toHaveProperty('desa')
      expect(dto).toHaveProperty('alamat_spesifik')
      expect(dto).toHaveProperty('priority_score')
      expect(dto).toHaveProperty('priority_level')
      expect(dto).toHaveProperty('description')
      expect(dto).toHaveProperty('kondisi_mutakhir')
      expect(dto).toHaveProperty('has_shelter')
      expect(dto).toHaveProperty('reporter_name')
      expect(dto).toHaveProperty('whatsapp_number')
      expect(dto).toHaveProperty('photo_data')
      expect(dto).toHaveProperty('event_date')
      expect(dto).toHaveProperty('probability_score')
      expect(dto).toHaveProperty('created_at')
      expect(dto).toHaveProperty('updated_at')
      
      // Check default values
      expect(dto.id).toBeUndefined()
      expect(dto.incident_code).toBeUndefined()
      expect(dto.title).toBeUndefined()
      expect(dto.disaster_type).toBeUndefined()
      expect(dto.status).toBeUndefined()
      expect(dto.location).toBeUndefined()
      expect(dto.region).toBeUndefined()
      expect(dto.kecamatan).toBeUndefined()
      expect(dto.desa).toBeUndefined()
      expect(dto.alamat_spesifik).toBeUndefined()
      expect(dto.priority_score).toBeUndefined()
      expect(dto.priority_level).toBeUndefined()
      expect(dto.description).toBeUndefined()
      expect(dto.kondisi_mutakhir).toBeUndefined()
      expect(dto.has_shelter).toBeUndefined()
      expect(dto.reporter_name).toBeUndefined()
      expect(dto.whatsapp_number).toBeUndefined()
      expect(dto.photo_data).toBeUndefined()
      expect(dto.event_date).toBeUndefined()
      expect(dto.probability_score).toBeUndefined()
      expect(dto.created_at).toBeUndefined()
      expect(dto.updated_at).toBeUndefined()
    })
    
    it('should set values correctly', () => {
      const dto = new IncidentResponseDTO()
      const testDate = new Date()
      const createdDate = new Date(testDate.getTime() - 3600000) // 1 hour ago
      const updatedDate = new Date(testDate.getTime() - 1800000) // 30 minutes ago
      
      dto.id = '456'
      dto.incident_code = 'INC001-RES'
      dto.title = 'Resolved Incident'
      dto.disaster_type = 'wildfire'
      dto.status = 'resolved'
      dto.location = { type: 'Point', coordinates: [107.0, -6.0] }
      dto.region = 'Surabaya'
      dto.kecamatan = 'Wonocolo'
      dto.desa = 'Kalisari'
      dto.alamat_spesifik = 'Jl. Resolved No. 789'
      dto.priority_score = 30
      dto.priority_level = 'low'
      dto.description = 'Resolved description'
      dto.kondisi_mutakhir = 'Under control'
      dto.has_shelter = true
      dto.reporter_name = 'Bob Wilson'
      dto.whatsapp_number = '081122334455'
      dto.photo_data = 'base64resolvedphoto'
      dto.event_date = testDate
      dto.probability_score = 20
      dto.created_at = createdDate
      dto.updated_at = updatedDate
      
      expect(dto.id).toBe('456')
      expect(dto.incident_code).toBe('INC001-RES')
      expect(dto.title).toBe('Resolved Incident')
      expect(dto.disaster_type).toBe('wildfire')
      expect(dto.status).toBe('resolved')
      expect(dto.location).toEqual({ type: 'Point', coordinates: [107.0, -6.0] })
      expect(dto.region).toBe('Surabaya')
      expect(dto.kecamatan).toBe('Wonocolo')
      expect(dto.desa).toBe('Kalisari')
      expect(dto.alamat_spesifik).toBe('Jl. Resolved No. 789')
      expect(dto.priority_score).toBe(30)
      expect(dto.priority_level).toBe('low')
      expect(dto.description).toBe('Resolved description')
      expect(dto.kondisi_mutakhir).toBe('Under control')
      expect(dto.has_shelter).toBe(true)
      expect(dto.reporter_name).toBe('Bob Wilson')
      expect(dto.whatsapp_number).toBe('081122334455')
      expect(dto.photo_data).toBe('base64resolvedphoto')
      expect(dto.event_date).toBe(testDate)
      expect(dto.probability_score).toBe(20)
      expect(dto.created_at).toBe(createdDate)
      expect(dto.updated_at).toBe(updatedDate)
    })
  })
})