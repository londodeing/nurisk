# T01 - Extract Authentication Logic

**Task**: Preserve 10-tier RBAC system with JWT and secret keys

**Current System**:
- Roles: SUPER_ADMIN(100) to PUBLIC(10)
- JWT_SECRET: PUSDATIN_JATENG_SECRET_2024
- Secret keys: PWNU_JATENG_BOSS, PCNU_JATENG_MEMBER
- Token expiry: 24h

**Requirements**:
- Extract authMiddleware logic
- Preserve role hierarchy
- Maintain secret key validation
- Keep JWT payload structure: {id, role, region}

**Output Files**:
- auth-middleware.js
- rbac-rules.json
- role-definitions.json

**Success Criteria**:
- All 10 roles preserved
- Secret key validation working
- JWT generation/validation intact
- Regional access control maintained

**Estimated Time**: 3 hours
