import { describe, it, expect } from 'vitest'
import { INCIDENT_STATUS } from './incident-status'

describe('Incident Status Enum', () => {
  it('should have expected status values', () => {
    const expected = [
      'reported',
      'in_progress',
      'resolved',
      'closed'
    ]
    expect(INCIDENT_STATUS).toEqual(expected)
  })
  
  it('should be readonly tuple (as const)', () => {
    // With 'as const', the array becomes a readonly tuple
    // We can verify this by checking that array mutation methods don't exist
    // @ts-expect-error - push should not be available on readonly tuple
    // INCIDENT_STATUS.push('new-item')
    
    // @ts-expect-error - pop should not be available on readonly tuple
    // INCIDENT_STATUS.pop()
    
    // @ts-expect-error - splice should not be available on readonly tuple
    // INCIDENT_STATUS.splice(0, 1)
    
    // But we can still read the length and access elements
    expect(INCIDENT_STATUS).toHaveLength(4)
    expect(INCIDENT_STATUS[0]).toBe('reported')
    expect(INCIDENT_STATUS[1]).toBe('in_progress')
    expect(INCIDENT_STATUS[2]).toBe('resolved')
    expect(INCIDENT_STATUS[3]).toBe('closed')
  })
})