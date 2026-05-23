/**
 * Security Event Monitoring Service
 * PHASE-12: Detect abuse and malicious behavior
 */
import { Injectable, Logger } from '@nestjs/common';

export type SecurityEventType =
  | 'failed_login'
  | 'panic_abuse'
  | 'rate_limit_exceeded'
  | 'suspicious_upload'
  | 'payload_anomaly'
  | 'invalid_token';

export interface SecurityEvent {
  type: SecurityEventType;
  ip?: string;
  userId?: string;
  endpoint?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class SecurityMonitorService {
  private readonly logger = new Logger(SecurityMonitorService.name);
  private events: SecurityEvent[] = [];
  private readonly maxEvents = 1000;

  // Track rate limits per IP
  private failedLogins = new Map<string, number[]>();
  private panicAttempts = new Map<string, number[]>();
  private rateLimitHits = new Map<string, number>();

  private readonly thresholds = {
    failedLogins: 5, // per 15 minutes
    panicAttempts: 3, // per minute
    rateLimitHits: 10, // per minute
  };

  /**
   * Record security event
   */
  record(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.events.push(fullEvent);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Log based on severity
    if (event.type === 'failed_login') {
      this.logger.warn(`[SECURITY] Failed login: ${event.ip} ${event.details?.email || ''}`);
    } else if (event.type === 'panic_abuse') {
      this.logger.error(`[SECURITY] Panic abuse: ${event.ip} ${event.endpoint}`);
    } else if (event.type === 'rate_limit_exceeded') {
      this.logger.warn(`[SECURITY] Rate limit: ${event.ip} ${event.endpoint}`);
    } else if (event.type === 'suspicious_upload') {
      this.logger.error(`[SECURITY] Suspicious upload: ${event.ip}`);
    } else if (event.type === 'payload_anomaly') {
      this.logger.error(`[SECURITY] Payload anomaly: ${event.ip} ${event.endpoint}`);
    }
  }

  /**
   * Check failed login threshold
   */
  checkFailedLogin(ip: string): boolean {
    const now = Date.now();
    const window = 15 * 60 * 1000; // 15 minutes

    const attempts = this.failedLogins.get(ip) || [];
    const recent = attempts.filter((t) => now - t < window);

    if (recent.length >= this.thresholds.failedLogins) {
      this.record({
        type: 'failed_login',
        ip,
        details: { count: recent.length },
      });
      return true;
    }

    recent.push(now);
    this.failedLogins.set(ip, recent);
    return false;
  }

  /**
   * Check panic abuse
   */
  checkPanicAbuse(ip: string): boolean {
    const now = Date.now();
    const window = 60 * 1000; // 1 minute

    const attempts = this.panicAttempts.get(ip) || [];
    const recent = attempts.filter((t) => now - t < window);

    if (recent.length >= this.thresholds.panicAttempts) {
      this.record({
        type: 'panic_abuse',
        ip,
        endpoint: '/api/incidents/panic',
      });
      return true;
    }

    recent.push(now);
    this.panicAttempts.set(ip, recent);
    return false;
  }

  /**
   * Check rate limit abuse
   */
  checkRateLimitAbuse(ip: string): boolean {
    const now = Date.now();
    const window = 60 * 1000; // 1 minute

    const hits = this.rateLimitHits.get(ip) || 0;
    const recent = hits + 1;

    if (recent >= this.thresholds.rateLimitHits) {
      this.record({
        type: 'rate_limit_exceeded',
        ip,
      });
      this.rateLimitHits.set(ip, 0); // Reset
      return true;
    }

    this.rateLimitHits.set(ip, recent);
    return false;
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  /**
   * Get events by IP
   */
  getEventsByIp(ip: string): SecurityEvent[] {
    return this.events.filter((e) => e.ip === ip);
  }
}