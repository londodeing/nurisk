# T03 - JWT Token Management

**Task**: Preserve JWT token generation and validation system

**Current JWT Configuration**:
- Secret: PUSDATIN_JATENG_SECRET_2024
- Expiry: 24h
- Payload: {id, role, region}
- Algorithm: HS256

**Token Lifecycle**:
1. Login with username/password + secret_key (if required)
2. Validate credentials and secret_key
3. Generate JWT with user payload
4. Return token for API authentication
5. Middleware validates token on protected routes

**Implementation Requirements**:
```js
// JWT payload structure
const payload = {
  id: user.id,
  role: user.role,
  region: user.region,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
};

// Middleware validation
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = decoded;
  next();
};
```

**Success Criteria**:
- JWT generation working
- Token validation functional
- 24h expiry enforced
- Payload structure preserved
- Middleware integration complete

**Estimated Time**: 2 hours
