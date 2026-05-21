import { describe, it, expect } from 'vitest'
import { LoginDTO, RegisterDTO, TokenResponseDTO } from './auth.dto'

describe('Auth DTOs', () => {
  describe('LoginDTO', () => {
    it('should create instance with undefined values', () => {
      const dto = new LoginDTO()
      expect(dto).toHaveProperty('username')
      expect(dto).toHaveProperty('password')
      expect(dto.username).toBeUndefined()
      expect(dto.password).toBeUndefined()
    })
    
    it('should set values correctly', () => {
      const dto = new LoginDTO()
      dto.username = 'testuser'
      dto.password = 'testpass'
      expect(dto.username).toBe('testuser')
      expect(dto.password).toBe('testpass')
    })
  })
  
  describe('RegisterDTO', () => {
    it('should create instance with undefined values', () => {
      const dto = new RegisterDTO()
      expect(dto).toHaveProperty('username')
      expect(dto).toHaveProperty('password')
      expect(dto).toHaveProperty('full_name')
      expect(dto).toHaveProperty('role')
      expect(dto).toHaveProperty('region')
      expect(dto).toHaveProperty('email')
      expect(dto).toHaveProperty('phone_number')
      expect(dto.whatsapp_number).toBeUndefined()
      expect(dto.avatar_url).toBeUndefined()
    })
    
    it('should set values correctly', () => {
      const dto = new RegisterDTO()
      dto.username = 'testuser'
      dto.password = 'testpass'
      dto.full_name = 'Test User'
      dto.role = 'admin'
      dto.region = 'jakarta'
      dto.email = 'test@example.com'
      dto.phone_number = '08123456789'
      dto.whatsapp_number = '08123456789'
      dto.avatar_url = 'http://example.com/avatar.jpg'
      
      expect(dto.username).toBe('testuser')
      expect(dto.password).toBe('testpass')
      expect(dto.full_name).toBe('Test User')
      expect(dto.role).toBe('admin')
      expect(dto.region).toBe('jakarta')
      expect(dto.email).toBe('test@example.com')
      expect(dto.phone_number).toBe('08123456789')
      expect(dto.whatsapp_number).toBe('08123456789')
      expect(dto.avatar_url).toBe('http://example.com/avatar.jpg')
    })
  })
  
  describe('TokenResponseDTO', () => {
    it('should create instance with undefined/default values', () => {
      const dto = new TokenResponseDTO()
      expect(dto).toHaveProperty('access_token')
      expect(dto).toHaveProperty('expires_in')
      expect(dto).toHaveProperty('token_type')
      expect(dto).toHaveProperty('user')
      
      // Check default values
      expect(dto.access_token).toBeUndefined()
      expect(dto.expires_in).toBeUndefined()
      expect(dto.token_type).toBe('Bearer') // This has a default value
      expect(dto.user).toBeUndefined() // user is not initialized by default
    })
    
    it('should set values correctly', () => {
      const dto = new TokenResponseDTO()
      dto.access_token = 'testtoken123'
      dto.expires_in = 3600
      dto.token_type = 'Bearer'
      dto.user = {
        id: '1',
        username: 'testuser',
        full_name: 'Test User',
        role: 'admin',
        email: 'test@example.com',
        phone_number: '08123456789',
        region: 'jakarta'
      }
      
      expect(dto.access_token).toBe('testtoken123')
      expect(dto.expires_in).toBe(3600)
      expect(dto.token_type).toBe('Bearer')
      expect(dto.user).toEqual({
        id: '1',
        username: 'testuser',
        full_name: 'Test User',
        role: 'admin',
        email: 'test@example.com',
        phone_number: '08123456789',
        region: 'jakarta'
      })
    })
  })
})