/**
 * Rule Engine
 * ===========
 * JSON Logic rule evaluation with custom operations
 */

import JsonLogic from 'json-logic-js';

// ==========================================================
// Custom Operations
// ==========================================================

/**
 * geoWithin - Check if coordinates are within a polygon
 * Usage: {"geoWithin": [{"var": "event.location"}, polygon]}
 */
function geoWithin(data: unknown): boolean {
  const args = JsonLogic.get_values(data as Record<string, any>);
  if (args.length < 2) return false;

  const [point, polygon] = args;
  
  if (!point || !polygon || !Array.isArray(polygon)) return false;
  
  // Point format: [lng, lat] or {lat, lng}
  // Polygon format: [[lng, lat], [lng, lat], ...]
  let coords: [number, number];
  
  if (Array.isArray(point)) {
    coords = [point[0], point[1]];
  } else if (typeof point === 'object' && point !== null) {
    const p = point as Record<string, unknown>;
    coords = [p.lng as number, p.lat as number];
  } else {
    return false;
  }

  // Ray casting algorithm for point in polygon
  const [x, y] = coords;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = (polygon[i] as [number, number])[0];
    const yi = (polygon[i] as [number, number])[1];
    const xj = (polygon[j] as [number, number])[0];
    const yj = (polygon[j] as [number, number])[1];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * severityGte - Check if severity is greater than or equal
 * Usage: {"severityGte": [{"var": "event.severity"}, 3]}
 */
function severityGte(data: unknown): boolean {
  const args = JsonLogic.get_values(data as Record<string, any>);
  if (args.length < 2) return false;

  const [severity, threshold] = args;
  const severityNum = typeof severity === 'number' ? severity : 0;
  const thresholdNum = typeof threshold === 'number' ? threshold : 0;

  return severityNum >= thresholdNum;
}

/**
 * timeSince - Check time elapsed since a timestamp
 * Usage: {"timeSince": [{"var": "event.timestamp"}, 3600]} // 1 hour in seconds
 */
function timeSince(data: unknown): boolean {
  const args = JsonLogic.get_values(data as Record<string, any>);
  if (args.length < 2) return false;

  const [timestamp, seconds] = args;
  
  if (!timestamp) return false;
  
  const timestampMs = typeof timestamp === 'number' 
    ? timestamp 
    : new Date(timestamp as string).getTime();
    
  if (isNaN(timestampMs)) return false;
  
  const elapsedSeconds = (Date.now() - timestampMs) / 1000;
  const thresholdSeconds = typeof seconds === 'number' ? seconds : 0;
  
  return elapsedSeconds >= thresholdSeconds;
}

/**
 * hasRole - Check if user has a specific role
 * Usage: {"hasRole": [{"var": "session.user.role"}, "ADMIN"]}
 */
function hasRole(data: unknown): boolean {
  const args = JsonLogic.get_values(data as Record<string, any>);
  if (args.length < 2) return false;

  const [userRole, requiredRole] = args;
  
  if (!userRole || !requiredRole) return false;
  
  // Handle array of roles
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
}

/**
 * inRegion - Check if coordinates are in a specific region
 * Usage: {"inRegion": [{"var": "event.location"}, "JATENG"]}
 */
function inRegion(data: unknown): boolean {
  const args = JsonLogic.get_values(data as Record<string, any>);
  if (args.length < 2) return false;

  const [location, region] = args;
  
  if (!location || !region) return false;
  
  // Check if location has region property
  if (typeof location === 'object' && location !== null) {
    const loc = location as Record<string, unknown>;
    return loc.region === region;
  }
  
  return false;
}

/**
 * matchesPattern - Check if string matches a regex pattern
 * Usage: {"matchesPattern": [{"var": "event.type"}, "^Banjir.*"]}
 */
function matchesPattern(data: unknown): boolean {
  const args = JsonLogic.get_values(data as Record<string, any>);
  if (args.length < 2) return false;

  const [str, pattern] = args;
  
  if (typeof str !== 'string' || typeof pattern !== 'string') return false;
  
  try {
    const regex = new RegExp(pattern);
    return regex.test(str);
  } catch {
    return false;
  }
}

// ==========================================================
// Register Custom Operations
// ==========================================================

// Type assertion to add missing extend method to JsonLogic type
type JsonLogicExtended = typeof JsonLogic & {
  extend: (name: string, fn: (...args: unknown[]) => unknown) => void;
};

(JsonLogic as JsonLogicExtended).extend('geoWithin', geoWithin);
(JsonLogic as JsonLogicExtended).extend('severityGte', severityGte);
(JsonLogic as JsonLogicExtended).extend('timeSince', timeSince);
(JsonLogic as JsonLogicExtended).extend('hasRole', hasRole);
(JsonLogic as JsonLogicExtended).extend('inRegion', inRegion);
(JsonLogic as JsonLogicExtended).extend('matchesPattern', matchesPattern);

// ==========================================================
// RuleEngine Class
// ==========================================================

export class RuleEngine {
  /**
   * Evaluate a JSON Logic condition against context data
   */
  evaluate(condition: unknown, context: Record<string, unknown>): boolean {
    try {
      // Use unknown type assertion since JsonLogic.Rule type is not properly exported
      return JsonLogic.apply(condition as Parameters<typeof JsonLogic.apply>[0], context) as boolean;
    } catch (error) {
      console.error('[RULE_ENGINE] Evaluation error:', error);
      return false;
    }
  }

  /**
   * Evaluate multiple conditions and return results
   */
  evaluateMany(
    conditions: Array<{ id: number; name: string; condition: unknown }>,
    context: Record<string, unknown>
  ): Array<{ id: number; name: string; matched: boolean; time_ms: number }> {
    return conditions.map(({ id, name, condition }) => {
      const start = Date.now();
      const matched = this.evaluate(condition, context);
      const time_ms = Date.now() - start;
      
      return { id, name, matched, time_ms };
    });
  }
}

export default RuleEngine;