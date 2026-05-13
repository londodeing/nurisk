# T02 - Create Role Hierarchy Configuration

**Task**: Create structured role hierarchy with access levels and detailed permission matrix

**Detailed Implementation Steps**:

1. **Create Complete Role Hierarchy** (`role-hierarchy.json`):
```json
{
  "roles": {
    "SUPER_ADMIN": { 
      "level": 100, 
      "secret_key": "PWNU", 
      "scope": "all",
      "description": "Full system access",
      "regions": ["*"],
      "can_create_users": true,
      "can_delete_data": true
    },
    "ADMIN_PWNU": { 
      "level": 90, 
      "secret_key": "PWNU", 
      "scope": "province",
      "description": "Province-level admin",
      "regions": ["Jawa Tengah"],
      "can_create_users": true,
      "can_delete_data": false
    },
    "PWNU": { 
      "level": 85, 
      "secret_key": "PWNU", 
      "scope": "province",
      "description": "PWNU staff",
      "regions": ["Jawa Tengah"],
      "can_create_users": false,
      "can_delete_data": false
    },
    "STAFF_PWNU": { 
      "level": 80, 
      "secret_key": "PWNU", 
      "scope": "province",
      "description": "PWNU operational staff",
      "regions": ["Jawa Tengah"],
      "can_create_users": false,
      "can_delete_data": false
    },
    "COMMANDER": { 
      "level": 75, 
      "secret_key": "PWNU", 
      "scope": "operations",
      "description": "Operation commander",
      "regions": ["Jawa Tengah"],
      "can_create_users": false,
      "can_delete_data": false
    },
    "ADMIN_PCNU": { 
      "level": 70, 
      "secret_key": "PCNU", 
      "scope": "regency",
      "description": "Regency-level admin",
      "regions": ["user_region_only"],
      "can_create_users": true,
      "can_delete_data": false
    },
    "STAFF_PCNU": { 
      "level": 60, 
      "secret_key": "PCNU", 
      "scope": "regency",
      "description": "PCNU staff",
      "regions": ["user_region_only"],
      "can_create_users": false,
      "can_delete_data": false
    },
    "FIELD_STAFF": { 
      "level": 50, 
      "secret_key": null, 
      "scope": "field",
      "description": "Field operator",
      "regions": ["user_region_only"],
      "can_create_users": false,
      "can_delete_data": false
    },
    "RELAWAN": { 
      "level": 40, 
      "secret_key": null, 
      "scope": "volunteer",
      "description": "Volunteer",
      "regions": ["user_region_only"],
      "can_create_users": false,
      "can_delete_data": false
    },
    "PUBLIC": { 
      "level": 10, 
      "secret_key": null, 
      "scope": "public",
      "description": "Public user",
      "regions": [],
      "can_create_users": false,
      "can_delete_data": false
    }
  }
}
```

2. **Create Detailed Access Matrix** (`access-matrix.json`):
```json
{
  "permissions": {
    "incidents": {
      "read_all": ["SUPER_ADMIN", "ADMIN_PWNU", "PWNU", "STAFF_PWNU", "COMMANDER"],
      "read_regional": ["ADMIN_PCNU", "STAFF_PCNU", "FIELD_STAFF", "RELAWAN"],
      "create": ["SUPER_ADMIN", "ADMIN_PWNU", "PWNU", "STAFF_PWNU", "COMMANDER", "ADMIN_PCNU", "STAFF_PCNU", "FIELD_STAFF", "RELAWAN"],
      "update": ["SUPER_ADMIN", "ADMIN_PWNU", "PWNU", "STAFF_PWNU", "COMMANDER", "ADMIN_PCNU", "STAFF_PCNU", "FIELD_STAFF"],
      "delete": ["SUPER_ADMIN", "ADMIN_PWNU"],
      "assess": ["SUPER_ADMIN", "ADMIN_PWNU", "PWNU", "STAFF_PWNU", "COMMANDER", "ADMIN_PCNU", "FIELD_STAFF"]
    },
    "volunteers": {
      "read_all": ["SUPER_ADMIN", "ADMIN_PWNU", "PWNU", "STAFF_PWNU", "COMMANDER"],
      "read_regional": ["ADMIN_PCNU", "STAFF_PCNU"],
      "create": ["SUPER_ADMIN", "ADMIN_PWNU", "ADMIN_PCNU"],
      "update": ["SUPER_ADMIN", "ADMIN_PWNU", "ADMIN_PCNU", "FIELD_STAFF", "RELAWAN"],
      "delete": ["SUPER_ADMIN", "ADMIN_PWNU", "ADMIN_PCNU"]
    },
    "emergency": {
      "broadcast": ["PWNU"],
      "alerts": ["SUPER_ADMIN", "ADMIN_PWNU"],
      "chat_broadcast": ["PWNU"]
    },
    "audit": {
      "read": ["SUPER_ADMIN", "ADMIN_PWNU"],
      "create": ["*"]
    },
    "analytics": {
      "read": ["SUPER_ADMIN", "ADMIN_PWNU", "PWNU", "STAFF_PWNU", "COMMANDER", "ADMIN_PCNU"]
    },
    "public": {
      "report": ["*"],
      "map_view": ["*"],
      "historical_data": ["*"]
    }
  },
  "regional_filters": {
    "all_regions": ["SUPER_ADMIN", "ADMIN_PWNU", "PWNU", "STAFF_PWNU", "COMMANDER"],
    "user_region_only": ["ADMIN_PCNU", "STAFF_PCNU", "FIELD_STAFF", "RELAWAN"],
    "no_filter": ["PUBLIC"]
  }
}
```

3. **Create Permission Rules Engine** (`permission-rules.js`):
```js
class PermissionManager {
  constructor(roleHierarchy, accessMatrix) {
    this.roles = roleHierarchy.roles;
    this.permissions = accessMatrix.permissions;
    this.regionalFilters = accessMatrix.regional_filters;
  }

  hasPermission(userRole, resource, action) {
    const permission = this.permissions[resource]?.[action];
    if (!permission) return false;
    
    return permission.includes(userRole) || permission.includes('*');
  }

  canAccessRegion(userRole, userRegion, targetRegion) {
    if (this.regionalFilters.all_regions.includes(userRole)) {
      return true;
    }
    
    if (this.regionalFilters.user_region_only.includes(userRole)) {
      return userRegion === targetRegion;
    }
    
    return this.regionalFilters.no_filter.includes(userRole);
  }

  getRoleLevel(role) {
    return this.roles[role]?.level || 0;
  }

  requiresSecretKey(role) {
    return this.roles[role]?.secret_key !== null;
  }

  getRequiredSecretKey(role) {
    return this.roles[role]?.secret_key;
  }

  filterDataByRole(data, userRole, userRegion) {
    if (this.regionalFilters.all_regions.includes(userRole)) {
      return data;
    }
    
    if (this.regionalFilters.user_region_only.includes(userRole)) {
      return data.filter(item => item.region === userRegion);
    }
    
    return data;
  }
}

module.exports = PermissionManager;
```

4. **Create Role Validation Middleware** (`role-validator.js`):
```js
const PermissionManager = require('./permission-rules');
const roleHierarchy = require('./role-hierarchy.json');
const accessMatrix = require('./access-matrix.json');

const permissionManager = new PermissionManager(roleHierarchy, accessMatrix);

const validatePermission = (resource, action) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!permissionManager.hasPermission(userRole, resource, action)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: `${resource}:${action}`,
        userRole: userRole
      });
    }
    
    next();
  };
};

const validateRegionalAccess = (req, res, next) => {
  const userRole = req.user?.role;
  const userRegion = req.user?.region;
  const targetRegion = req.params.region || req.body.region || req.query.region;
  
  if (targetRegion && !permissionManager.canAccessRegion(userRole, userRegion, targetRegion)) {
    return res.status(403).json({ 
      error: 'Regional access denied',
      userRegion: userRegion,
      targetRegion: targetRegion
    });
  }
  
  next();
};

module.exports = {
  validatePermission,
  validateRegionalAccess,
  permissionManager
};
```

5. **Create Central Java Regency Mapping** (`central-java-regions.json`):
```json
{
  "kabupaten": [
    "Banjarnegara", "Banyumas", "Batang", "Blora", "Boyolali", "Brebes",
    "Cilacap", "Demak", "Grobogan", "Jepara", "Karanganyar", "Kebumen",
    "Kendal", "Klaten", "Kudus", "Magelang", "Pati", "Pekalongan",
    "Pemalang", "Purbalingga", "Purworejo", "Rembang", "Semarang",
    "Sragen", "Sukoharjo", "Tegal", "Temanggung", "Wonogiri", "Wonosobo"
  ],
  "kota": [
    "Kota Magelang", "Kota Pekalongan", "Kota Salatiga", 
    "Kota Semarang", "Kota Surakarta", "Kota Tegal"
  ],
  "aliases": {
    "Solo": "Kota Surakarta",
    "Semarang": "Kota Semarang"
  }
}
```

**Implementation Validation**:

1. **Test Role Hierarchy**:
```js
// Test role level comparison
console.assert(permissionManager.getRoleLevel('SUPER_ADMIN') > permissionManager.getRoleLevel('ADMIN_PWNU'));
console.assert(permissionManager.getRoleLevel('ADMIN_PWNU') > permissionManager.getRoleLevel('PWNU'));

// Test secret key requirements
console.assert(permissionManager.requiresSecretKey('ADMIN_PWNU') === true);
console.assert(permissionManager.requiresSecretKey('RELAWAN') === false);
```

2. **Test Permission Matrix**:
```js
// Test incident permissions
console.assert(permissionManager.hasPermission('SUPER_ADMIN', 'incidents', 'read_all') === true);
console.assert(permissionManager.hasPermission('RELAWAN', 'incidents', 'read_all') === false);
console.assert(permissionManager.hasPermission('RELAWAN', 'incidents', 'read_regional') === true);
```

3. **Test Regional Access**:
```js
// Test regional filtering
console.assert(permissionManager.canAccessRegion('SUPER_ADMIN', 'Semarang', 'Kudus') === true);
console.assert(permissionManager.canAccessRegion('ADMIN_PCNU', 'Semarang', 'Kudus') === false);
console.assert(permissionManager.canAccessRegion('ADMIN_PCNU', 'Semarang', 'Semarang') === true);
```

**Output Files**:
- `role-hierarchy.json` - Complete role definitions with metadata
- `access-matrix.json` - Detailed permission matrix
- `permission-rules.js` - Permission management engine
- `role-validator.js` - Express middleware for validation
- `central-java-regions.json` - Regional mapping for validation

**Success Criteria**:
- 10-tier hierarchy defined with complete metadata
- Secret key requirements mapped and validated
- Regional access rules implemented and tested
- Permission inheritance working with level-based access
- Middleware integration ready for API endpoints
- Performance: Permission check < 10ms per request
- All 35 Central Java regions mapped correctly

**Estimated Time**: 6 hours
