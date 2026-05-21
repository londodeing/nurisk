import { describe, it, expect } from 'vitest'
import { DISASTER_TYPES } from './disaster-type'

describe('Disaster Types Enum', () => {
  it('should have expected disaster type values', () => {
    const expected = [
      'flood',
      'earthquake',
      'hurricane',
      'wildfire',
      'tsunami',
      'drought'
    ]
    expect(DISASTER_TYPES).toEqual(expected)
  })
  
  it('should be readonly tuple (as const)', () => {
    // With 'as const', the array becomes a readonly tuple
    // We can verify this by checking that it has a fixed length and indexed types
    // In practice, we mainly care that it's typed as a readonly tuple at compile time
    // For runtime testing, we can check that it behaves like a tuple
    
    // Check length
    expect(DISASTER_TYPES).toHaveLength(6)
    
    // Check that we can access elements by index
    expect(DISASTER_TYPES[0]).toBe('flood')
    expect(DISASTER_TYPES[5]).toBe('drought')
    
    // Note: Runtime immutability is not guaranteed with 'as const' alone
    // It only provides compile-time type safety
  })
})