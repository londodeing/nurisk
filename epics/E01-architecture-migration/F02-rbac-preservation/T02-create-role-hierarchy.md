# T02 - Create Role Hierarchy Configuration

**Task**: Create structured role hierarchy with access levels

**Role Hierarchy** (from mainprd.md):
```json
{
  "SUPER_ADMIN": { "level": 100, "secret_key": "PWNU", "scope": "all" },
  "ADMIN_PWNU": { "level": 90, "secret_key": "PWNU", "scope": "province" },
  "PWNU": { "level": 85, "secret_key": "PWNU", "scope": "province" },
  "STAFF_PWNU": { "level": 80, "secret_key": "PWNU", "scope": "province" },
  "COMMANDER": { "level": 75, "secret_key": "PWNU", "scope": "operations" },
  "ADMIN_PCNU": { "level": 70, "secret_key": "PCNU", "scope": "regency" },
  "STAFF_PCNU": { "level": 60, "secret_key": "PCNU", "scope": "regency" },
  "FIELD_STAFF": { "level": 50, "secret_key": null, "scope": "field" },
  "RELAWAN": { "level": 40, "secret_key": null, "scope": "volunteer" },
  "PUBLIC": { "level": 10, "secret_key": null, "scope": "public" }
}
```

**Access Matrix**:
- Level >= 85: All incidents, emergency broadcast
- Level >= 70: Regional incidents, chat broadcast
- Level >= 50: Field operations, assessments
- Level >= 40: Volunteer tasks, status updates
- Level >= 10: Public reporting, map viewing

**Output Files**:
- role-hierarchy.json
- access-matrix.json
- permission-rules.js

**Success Criteria**:
- 10-tier hierarchy defined
- Secret key requirements mapped
- Regional access rules clear
- Permission inheritance working

**Estimated Time**: 3 hours
