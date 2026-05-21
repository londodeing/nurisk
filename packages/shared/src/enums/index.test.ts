import { describe, it, expect } from 'vitest'
import * as enums from '.'

describe('Enums Index', () => {
  it('should export all enum files', () => {
    expect(enums).toHaveProperty('DISASTER_TYPES')
    expect(enums).toHaveProperty('INCIDENT_STATUS')
    expect(enums).toHaveProperty('INCIDENT_SEVERITY')
    expect(enums).toHaveProperty('INCIDENT_SOURCE')
    expect(enums).toHaveProperty('ROLES')
    expect(enums).toHaveProperty('BRANCH')
    expect(enums).toHaveProperty('RANK')
    expect(enums).toHaveProperty('ASSET_TYPE')
    expect(enums).toHaveProperty('TRANSACTION_TYPE')
    expect(enums).toHaveProperty('CONDITION')
  })
})