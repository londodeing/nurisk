/**
 * Circuit Breaker Service
 * PHASE-12: Prevent external dependency collapse
 */
import { Injectable, Logger } from '@nestjs/common';

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold?: number; // failures before opening
  successThreshold?: number; // successes before closing
  timeout?: number; // ms to wait before half-open
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuits = new Map<string, CircuitState>();
  private failureCounts = new Map<string, number>();
  private successCounts = new Map<string, number>();
  private lastFailureTime = new Map<string, number>();
  private configs = new Map<string, CircuitBreakerConfig>();

  private readonly defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000, // 30 seconds
  };

  /**
   * Register a circuit
   */
  registerCircuit(name: string, config?: CircuitBreakerConfig): void {
    this.circuits.set(name, 'closed');
    this.failureCounts.set(name, 0);
    this.successCounts.set(name, 0);
    this.configs.set(name, { ...this.defaultConfig, ...config });
    this.logger.log(`[CIRCUIT] Registered: ${name}`);
  }

  /**
   * Check if circuit allows requests
   */
  isAvailable(name: string): boolean {
    const state = this.circuits.get(name) || 'closed';
    const config = this.configs.get(name);
    const cfg = config ?? this.defaultConfig;

    if (state === 'closed') return true;

    if (state === 'open') {
      const lastFailure = this.lastFailureTime.get(name) || 0;
      const now = Date.now();
      // Check if timeout expired
      if (now - lastFailure > (cfg.timeout ?? 30000)) {
        this.circuits.set(name, 'half-open');
        this.logger.log(`[CIRCUIT] ${name}: half-open (timeout expired)`);
        return true;
      }
      return false;
    }

    // half-open - allow one request
    return true;
  }

  /**
   * Record success
   */
  recordSuccess(name: string): void {
    const state = this.circuits.get(name);
    if (!state) return;

    if (state === 'half-open') {
      const successes = (this.successCounts.get(name) || 0) + 1;
      this.successCounts.set(name, successes);

      const config = this.configs.get(name);
      const cfg = config ?? this.defaultConfig;
      if (successes >= (cfg.successThreshold ?? 2)) {
        this.circuits.set(name, 'closed');
        this.failureCounts.set(name, 0);
        this.successCounts.set(name, 0);
        this.logger.log(`[CIRCUIT] ${name}: closed (recovered)`);
      }
    } else {
      // Reset failure count on success in closed state
      this.failureCounts.set(name, 0);
    }
  }

  /**
   * Record failure
   */
  recordFailure(name: string): void {
    const state = this.circuits.get(name);
    if (!state) return;

    const failures = (this.failureCounts.get(name) || 0) + 1;
    this.failureCounts.set(name, failures);
    this.lastFailureTime.set(name, Date.now());

    const config = this.configs.get(name);
    const cfg = config ?? this.defaultConfig;

    if (state === 'closed' && failures >= (cfg.failureThreshold ?? 5)) {
      this.circuits.set(name, 'open');
      this.logger.warn(`[CIRCUIT] ${name}: open (${failures} failures)`);
    } else if (state === 'half-open') {
      this.circuits.set(name, 'open');
      this.successCounts.set(name, 0);
      this.logger.warn(`[CIRCUIT] ${name}: open (half-open failure)`);
    }
  }

  /**
   * Get circuit state
   */
  getState(name: string): CircuitState {
    return this.circuits.get(name) || 'closed';
  }

  /**
   * Execute with circuit protection
   */
  async execute<T>(
    name: string,
    fn: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    if (!this.isAvailable(name)) {
      return fallback();
    }

    try {
      const result = await fn();
      this.recordSuccess(name);
      return result;
    } catch (error) {
      this.recordFailure(name);
      throw error;
    }
  }
}