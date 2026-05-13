# T01 - Extract Authentication Logic

**Task**: Preserve 10-tier RBAC system with JWT and secret keys

**Current System Analysis** (from mainprd.md):
- Roles: SUPER_ADMIN(100) to PUBLIC(10)
- JWT_SECRET: PUSDATIN_JATENG_SECRET_2024
- Secret keys: PWNU_JATENG_BOSS, PCNU_JATENG_MEMBER
- Token expiry: 24h

**Detailed Extraction Steps**:

1. **Extract Current Auth Middleware**:
```js
// From existing backend/src/controllers/auth_controller.js
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'PUSDATIN_JATENG_SECRET_2024');
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

2. **Document Role Requirements** (from mainprd.md):
```js
// Secret key requirements mapping
const roleRequirement = {
  'SUPER_ADMIN': process.env.SECRET_KEY_PWNU || "PWNU_JATENG_BOSS",
  'ADMIN_PWNU': process.env.SECRET_KEY_PWNU || "PWNU_JATENG_BOSS", 
  'PWNU': process.env.SECRET_KEY_PWNU || "PWNU_JATENG_BOSS",
  'STAFF_PWNU': process.env.SECRET_KEY_PWNU || "PWNU_JATENG_BOSS",
  'COMMANDER': process.env.SECRET_KEY_PWNU || "PWNU_JATENG_BOSS",
  'ADMIN_PCNU': process.env.SECRET_KEY_PCNU || "PCNU_JATENG_MEMBER",
  'STAFF_PCNU': process.env.SECRET_KEY_PCNU || "PCNU_JATENG_MEMBER",
  'FIELD_STAFF': null, // No secret key required
  'RELAWAN': null,     // No secret key required
  'PUBLIC': null       // No secret key required
};
```

3. **Extract Registration Logic**:
```js
// From existing registration endpoint
const validateRegistration = (userData) => {
  const { username, password, full_name, region, role, secret_key } = userData;
  
  // Required fields validation
  if (!username || !password || !full_name || !region) {
    throw new Error('Missing required fields');
  }
  
  // Secret key validation for privileged roles
  const requiredKey = roleRequirement[role];
  if (requiredKey && secret_key !== requiredKey) {
    throw new Error('Invalid secret key for role');
  }
  
  // Password hashing with bcrypt salt rounds=10
  const passwordHash = bcrypt.hashSync(password, 10);
  
  return {
    username: username.toLowerCase().trim(),
    password: passwordHash,
    full_name,
    region,
    role: role || 'RELAWAN'
  };
};
```

4. **Extract JWT Token Generation**:
```js
// JWT payload structure preservation
const generateToken = (user) => {
  const payload = {
    id: user.id,
    role: user.role,
    region: user.region,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'PUSDATIN_JATENG_SECRET_2024');
};
```

5. **Extract Regional Access Control**:
```js
// Regional filtering logic from existing controllers
const filterByRegion = (req, data) => {
  const userRole = req.user.role;
  const userRegion = req.user.region;
  
  // PWNU roles see all regions
  if (['SUPER_ADMIN', 'ADMIN_PWNU', 'PWNU', 'STAFF_PWNU', 'COMMANDER'].includes(userRole)) {
    return data;
  }
  
  // PCNU roles see only their region
  if (['ADMIN_PCNU', 'STAFF_PCNU'].includes(userRole)) {
    return data.filter(item => item.region === userRegion);
  }
  
  // Field staff and volunteers see their region
  return data.filter(item => item.region === userRegion);
};
```

**Output Files Structure**:

1. **auth-middleware.js** - Complete middleware with error handling
2. **rbac-rules.json** - Role permissions matrix
3. **role-definitions.json** - Role hierarchy with levels
4. **secret-key-validator.js** - Secret key validation logic
5. **jwt-manager.js** - Token generation and validation
6. **regional-filter.js** - Regional access control

**RBAC Rules Matrix** (from mainprd.md):
```json
{
  "audit_logs": ["SUPER_ADMIN", "ADMIN_PWNU"],
  "emergency_broadcast": ["PWNU"],
  "emergency_alerts": ["ADMIN_PWNU", "SUPER_ADMIN"],
  "chat_broadcast": ["PWNU"],
  "all_incidents": ["PWNU", "SUPER_ADMIN", "ADMIN_PWNU", "COMMANDER", "STAFF_PWNU"],
  "regional_incidents": ["ADMIN_PCNU", "STAFF_PCNU", "FIELD_STAFF", "RELAWAN"],
  "volunteer_management": ["ADMIN_PCNU"],
  "public_routes": ["PUBLIC"]
}
```

**Validation Tests**:
- Test all 10 role levels with correct permissions
- Verify secret key validation for PWNU/PCNU roles
- Test JWT token expiry (24h)
- Validate regional filtering for each role
- Test middleware error handling

**Success Criteria**:
- All 10 roles preserved with correct hierarchy levels
- Secret key validation working for privileged roles
- JWT generation/validation intact with 24h expiry
- Regional access control maintained per role
- Middleware handles all error cases gracefully
- Performance: Auth check < 50ms per request

**Estimated Time**: 6 hours
