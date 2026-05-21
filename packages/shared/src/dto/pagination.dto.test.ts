import { describe, it, expect } from 'vitest'
import { PaginatedRequestDTO, PaginatedResponseDTO } from './pagination.dto'

describe('Pagination DTOs', () => {
  describe('PaginatedRequestDTO', () => {
    it('should create instance with default values', () => {
      const dto = new PaginatedRequestDTO()
      expect(dto.page).toBe(1)
      expect(dto.limit).toBe(10)
      expect(dto.sortBy).toBeUndefined()
      expect(dto.sortOrder).toBe('asc')
    })
    
    it('should set values correctly', () => {
      const dto = new PaginatedRequestDTO()
      dto.page = 5
      dto.limit = 25
      dto.sortBy = 'createdAt'
      dto.sortOrder = 'desc'
      
      expect(dto.page).toBe(5)
      expect(dto.limit).toBe(25)
      expect(dto.sortBy).toBe('createdAt')
      expect(dto.sortOrder).toBe('desc')
    })
    
    it('should allow additional properties', () => {
      const dto = new PaginatedRequestDTO()
      dto.filters = { status: 'active' }
      dto.search = 'test'
      
      expect(dto.filters).toEqual({ status: 'active' })
      expect(dto.search).toBe('test')
    })
  })
  
  describe('PaginatedResponseDTO', () => {
    it('should create instance with constructor values', () => {
      const data = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }]
      const total = 50
      const page = 3
      const limit = 10
      
      const dto = new PaginatedResponseDTO(data, total, page, limit)
      
      expect(dto.data).toEqual(data)
      expect(dto.total).toBe(50)
      expect(dto.page).toBe(3)
      expect(dto.limit).toBe(10)
      expect(dto.totalPages).toBe(5) // 50/10 = 5
      expect(dto.hasNextPage).toBe(true) // 3 < 5
      expect(dto.hasPrevPage).toBe(true) // 3 > 1
    })
    
    it('should calculate totalPages correctly', () => {
      // Test exact division
      let dto = new PaginatedResponseDTO([], 40, 1, 10)
      expect(dto.totalPages).toBe(4)
      
      // Test with remainder
      dto = new PaginatedResponseDTO([], 45, 1, 10)
      expect(dto.totalPages).toBe(5) // ceil(45/10) = 5
      
      // Test single page
      dto = new PaginatedResponseDTO([], 5, 1, 10)
      expect(dto.totalPages).toBe(1)
    })
    
    it('should set hasNextPage correctly', () => {
      // Last page
      let dto = new PaginatedResponseDTO([], 25, 3, 10)
      expect(dto.hasNextPage).toBe(false) // page 3, totalPages 3
      
      // Not last page
      dto = new PaginatedResponseDTO([], 25, 2, 10)
      expect(dto.hasNextPage).toBe(true) // page 2, totalPages 3
      
      // Single page
      dto = new PaginatedResponseDTO([], 5, 1, 10)
      expect(dto.hasNextPage).toBe(false) // page 1, totalPages 1
    })
    
    it('should set hasPrevPage correctly', () => {
      // First page
      let dto = new PaginatedResponseDTO([], 25, 1, 10)
      expect(dto.hasPrevPage).toBe(false) // page 1
      
      // Not first page
      dto = new PaginatedResponseDTO([], 25, 2, 10)
      expect(dto.hasPrevPage).toBe(true) // page 2
    })
  })
})