# T03 - JWT Token Management

**Task**: Preserve JWT token generation and validation system with enhanced security

**Detailed Implementation Steps**:

1. **Enhanced JWT Configuration** (`jwt-config.js`):
```js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTManager {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'PUSDATIN_JATENG_SECRET_2024';
    this.algorithm = 'HS256';
    this.expiresIn = '24h';
    this.issuer = 'PUSDATIN_NU_JATENG';
    this.audience = 'nurisk-users';
  }

  generateToken(user) {
    const now = Math.floor(Date.now() / 1000);
    
    const payload = {
      // User identification
      id: user.id,
      role: user.role,
      region: user.region,
      
      // JWT standard claims
      iat: now,
      exp: now + (24 * 60 * 60), // 24 hours
      iss: this.issuer,
      aud: this.audience,
      sub: user.id.toString(),
      
      // Security enhancements
      jti: crypto.randomUUID(), // JWT ID for revocation
      session_id: crypto.randomBytes(16).toString('hex'),
      
      // Additional metadata
      login_time: now,
      user_agent_hash: this.hashUserAgent(user.user_agent),
      ip_hash: this.hashIP(user.ip_address)
    };

    return jwt.sign(payload, this.secret, {
      algorithm: this.algorithm,
      expiresIn: this.expiresIn
    });
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: [this.algorithm],
        issuer: this.issuer,
        audience: this.audience
      });
      
      // Additional validation
      this.validateTokenClaims(decoded);
      
      return {
        valid: true,
        payload: decoded,
        error: null
      };
    } catch (error) {
      return {
        valid: false,
        payload: null,
        error: error.message
      };
    }
  }

  validateTokenClaims(payload) {
    // Check required fields
    const requiredFields = ['id', 'role', 'region', 'jti', 'session_id'];
    for (const field of requiredFields) {
      if (!payload[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate role
    const validRoles = [
      'SUPER_ADMIN', 'ADMIN_PWNU', 'PWNU', 'STAFF_PWNU', 'COMMANDER',
      'ADMIN_PCNU', 'STAFF_PCNU', 'FIELD_STAFF', 'RELAWAN', 'PUBLIC'
    ];
    
    if (!validRoles.includes(payload.role)) {
      throw new Error(`Invalid role: ${payload.role}`);
    }
    
    // Check token age (additional security)
    const tokenAge = Math.floor(Date.now() / 1000) - payload.iat;
    if (tokenAge > (25 * 60 * 60)) { // 25 hours max (1 hour grace)
      throw new Error('Token expired beyond grace period');
    }
  }

  refreshToken(oldToken) {
    const verification = this.verifyToken(oldToken);
    if (!verification.valid) {
      throw new Error('Cannot refresh invalid token');
    }
    
    const payload = verification.payload;
    
    // Check if token is eligible for refresh (not too old)
    const tokenAge = Math.floor(Date.now() / 1000) - payload.iat;
    if (tokenAge > (20 * 60 * 60)) { // 20 hours max for refresh
      throw new Error('Token too old for refresh');
    }
    
    // Generate new token with same user data
    return this.generateToken({
      id: payload.id,
      role: payload.role,
      region: payload.region,
      user_agent: payload.user_agent_hash,
      ip_address: payload.ip_hash
    });
  }

  hashUserAgent(userAgent) {
    if (!userAgent) return null;
    return crypto.createHash('sha256').update(userAgent).digest('hex').substring(0, 16);
  }

  hashIP(ipAddress) {
    if (!ipAddress) return null;
    return crypto.createHash('sha256').update(ipAddress).digest('hex').substring(0, 16);
  }

  decodeTokenWithoutVerification(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }
}

module.exports = JWTManager;
```

2. **Enhanced Auth Middleware** (`auth-middleware.js`):
```js
const JWTManager = require('./jwt-config');
const jwtManager = new JWTManager();

const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided'
      });
    }

    // Verify token
    const verification = jwtManager.verifyToken(token);
    if (!verification.valid) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: verification.error
      });
    }

    // Additional security checks
    const payload = verification.payload;
    
    // Check user agent consistency (optional security measure)
    const currentUserAgentHash = jwtManager.hashUserAgent(req.headers['user-agent']);
    if (payload.user_agent_hash && payload.user_agent_hash !== currentUserAgentHash) {
      console.warn(`User agent mismatch for user ${payload.id}`);
      // Log but don't block (user agent can change legitimately)
    }

    // Attach user info to request
    req.user = {
      id: payload.id,
      role: payload.role,
      region: payload.region,
      session_id: payload.session_id,
      jti: payload.jti,
      login_time: payload.login_time
    };

    // Add token refresh helper
    req.refreshToken = () => {
      return jwtManager.refreshToken(token);
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication processing failed'
    });
  }
};

// Optional middleware for token refresh
const refreshTokenMiddleware = (req, res, next) => {
  try {
    const newToken = req.refreshToken();
    res.setHeader('X-New-Token', newToken);
    next();
  } catch (error) {
    // Don't fail the request, just log the refresh failure
    console.warn('Token refresh failed:', error.message);
    next();
  }
};

// Middleware for checking token expiry and auto-refresh
const autoRefreshMiddleware = (req, res, next) => {
  if (req.user && req.user.login_time) {
    const tokenAge = Math.floor(Date.now() / 1000) - req.user.login_time;
    
    // If token is older than 20 hours, try to refresh
    if (tokenAge > (20 * 60 * 60)) {
      try {
        const newToken = req.refreshToken();
        res.setHeader('X-New-Token', newToken);
        res.setHeader('X-Token-Refreshed', 'true');
      } catch (error) {
        console.warn('Auto-refresh failed:', error.message);
      }
    }
  }
  
  next();
};

module.exports = {
  authMiddleware,
  refreshTokenMiddleware,
  autoRefreshMiddleware,
  jwtManager
};
```

3. **Token Blacklist Management** (`token-blacklist.js`):
```js
class TokenBlacklist {
  constructor() {
    this.blacklistedTokens = new Set();
    this.blacklistedSessions = new Set();
    
    // Clean up expired tokens every hour
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000);
  }

  blacklistToken(jti, sessionId, expiresAt) {
    this.blacklistedTokens.add(jti);
    if (sessionId) {
      this.blacklistedSessions.add(sessionId);
    }
    
    // Store expiry time for cleanup
    setTimeout(() => {
      this.blacklistedTokens.delete(jti);
      if (sessionId) {
        this.blacklistedSessions.delete(sessionId);
      }
    }, expiresAt - Date.now());
  }

  isTokenBlacklisted(jti) {
    return this.blacklistedTokens.has(jti);
  }

  isSessionBlacklisted(sessionId) {
    return this.blacklistedSessions.has(sessionId);
  }

  blacklistAllUserSessions(userId) {
    // This would require database integration to find all user sessions
    // For now, we'll implement a simple user-based blacklist
    console.log(`Blacklisting all sessions for user ${userId}`);
  }

  cleanupExpiredTokens() {
    // Tokens are automatically removed by setTimeout
    console.log(`Token blacklist cleanup completed. Active blacklisted tokens: ${this.blacklistedTokens.size}`);
  }
}

const tokenBlacklist = new TokenBlacklist();

// Middleware to check blacklist
const checkBlacklistMiddleware = (req, res, next) => {
  if (req.user && req.user.jti) {
    if (tokenBlacklist.isTokenBlacklisted(req.user.jti)) {
      return res.status(401).json({
        error: 'Token revoked',
        message: 'This token has been blacklisted'
      });
    }
    
    if (req.user.session_id && tokenBlacklist.isSessionBlacklisted(req.user.session_id)) {
      return res.status(401).json({
        error: 'Session revoked',
        message: 'This session has been terminated'
      });
    }
  }
  
  next();
};

module.exports = {
  tokenBlacklist,
  checkBlacklistMiddleware
};
```

4. **Login Enhancement** (`enhanced-login.js`):
```js
const bcrypt = require('bcrypt');
const { jwtManager } = require('./auth-middleware');
const { permissionManager } = require('./role-validator');

const enhancedLogin = async (req, res) => {
  try {
    const { username, password, secret_key } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username and password are required'
      });
    }

    // Find user in database
    const user = await findUserByUsername(username.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password incorrect'
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password incorrect'
      });
    }

    // Check secret key requirement
    if (permissionManager.requiresSecretKey(user.role)) {
      const requiredKey = permissionManager.getRequiredSecretKey(user.role);
      const serverKey = requiredKey === 'PWNU' 
        ? process.env.SECRET_KEY_PWNU || 'PWNU_JATENG_BOSS'
        : process.env.SECRET_KEY_PCNU || 'PCNU_JATENG_MEMBER';
      
      if (!secret_key || secret_key !== serverKey) {
        return res.status(403).json({
          error: 'Secret key required',
          message: `Role ${user.role} requires valid secret key`
        });
      }
    }

    // Generate JWT token
    const token = jwtManager.generateToken({
      id: user.id,
      role: user.role,
      region: user.region,
      user_agent: req.headers['user-agent'],
      ip_address: req.ip
    });

    // Log successful login
    console.log(`User ${user.username} (${user.role}) logged in from ${req.ip}`);

    // Return token and user info
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        region: user.region
      },
      expires_in: '24h'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Login processing failed'
    });
  }
};

// Helper function (would be implemented with actual database)
async function findUserByUsername(username) {
  // This would query the actual users table
  // For now, return a mock structure
  return null;
}

module.exports = { enhancedLogin };
```

**Token Security Features**:

1. **JWT ID (jti)** for token revocation
2. **Session ID** for session management
3. **User agent hashing** for additional security
4. **IP address hashing** for location tracking
5. **Automatic token refresh** for long sessions
6. **Token blacklisting** for logout/revocation
7. **Enhanced validation** with multiple checks

**Integration with Existing System**:

```js
// Example API endpoint with enhanced auth
app.get('/api/incidents', 
  authMiddleware,
  checkBlacklistMiddleware,
  autoRefreshMiddleware,
  validatePermission('incidents', 'read_regional'),
  validateRegionalAccess,
  (req, res) => {
    // Your existing incident logic here
    res.json({ incidents: [] });
  }
);
```

**Success Criteria**:
- JWT generation working with enhanced security
- Token validation functional with multiple checks
- 24h expiry enforced with auto-refresh capability
- Payload structure preserved and enhanced
- Middleware integration complete with blacklisting
- Performance: Token operations < 50ms
- Security: Resistant to common JWT attacks
- Backward compatibility with existing tokens

**Estimated Time**: 8 hours
