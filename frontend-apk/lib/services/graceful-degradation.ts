/**
 * Graceful Degradation UI Handler
 * =========================
 * Handles UI changes based on connection state
 */

import { ConnectionState, degradedModeManager } from './degraded-mode';
import { localDatabase } from './local-database';

interface FeatureConfig {
  name: string;
  critical: boolean;
  offlineBehavior: 'disabled' | 'readonly' | 'queue';
}

const FEATURE_CONFIG: Record<string, FeatureConfig> = {
  // Critical features - always available
  incident_list: { name: 'Incident List', critical: true, offlineBehavior: 'readonly' },
  incident_detail: { name: 'Incident Detail', critical: true, offlineBehavior: 'readonly' },
  check_in: { name: 'Check In', critical: true, offlineBehavior: 'queue' },
  report_incident: { name: 'Report Incident', critical: true, offlineBehavior: 'queue' },
  messages: { name: 'Messages', critical: true, offlineBehavior: 'queue' },
  profile: { name: 'Profile', critical: true, offlineBehavior: 'readonly' },

  // Non-critical features - disabled when offline
  map_view: { name: 'Map View', critical: false, offlineBehavior: 'disabled' },
  analytics: { name: 'Analytics', critical: false, offlineBehavior: 'disabled' },
  real_time_tracking: { name: 'Real-time Tracking', critical: false, offlineBehavior: 'disabled' },
  live_chat: { name: 'Live Chat', critical: false, offlineBehavior: 'disabled' },
  broadcast: { name: 'Broadcast', critical: false, offlineBehavior: 'disabled' },
};

/**
 * Graceful Degradation Handler
 */
class GracefulDegradationHandler {
  private static instance: GracefulDegradationHandler;
  private currentFeatures: Set<string> = new Set();
  private statusBanner: HTMLElement | null = null;
  private listeners: Map<string, (config: FeatureConfig) => void> = new Map();

  private constructor() {
    this.setupConnectionListener();
  }

  static getInstance(): GracefulDegradationHandler {
    if (!GracefulDegradationHandler.instance) {
      GracefulDegradationHandler.instance = new GracefulDegradationHandler();
    }
    return GracefulDegradationHandler.instance;
  }

  /**
   * Setup connection state listener
   */
  private setupConnectionListener(): void {
    degradedModeManager.onConnectionChange((status) => {
      this.handleConnectionChange(status.state);
    });
  }

  /**
   * Handle connection state change
   */
  private handleConnectionChange(state: ConnectionState): void {
    console.log('[GRACEFUL] Connection state changed:', state);

    switch (state) {
      case ConnectionState.ONLINE:
        this.handleOnline();
        break;
      case ConnectionState.DEGRADED:
        this.handleDegraded();
        break;
      case ConnectionState.OFFLINE:
        this.handleOffline();
        break;
    }
  }

  /**
   * Handle online state
   */
  private handleOnline(): void {
    this.removeStatusBanner();
    this.enableAllFeatures();
    this.syncQueuedActions();
  }

  /**
   * Handle degraded state
   */
  private handleDegraded(): void {
    this.showStatusBanner('Degraded Mode', 'Some features may be slower than usual', 'warning');
    this.disableNonCriticalFeatures();
  }

  /**
   * Handle offline state
   */
  private handleOffline(): void {
    this.showStatusBanner('Offline Mode', 'You are currently offline. Some features are disabled.', 'error');
    this.disableNonCriticalFeatures();
  }

  /**
   * Show status banner
   */
  private showStatusBanner(title: string, message: string, type: 'warning' | 'error'): void {
    if (this.statusBanner) {
      this.removeStatusBanner();
    }

    const banner = document.createElement('div');
    banner.className = `status-banner status-banner--${type}`;
    banner.innerHTML = `
      <div class="status-banner__icon">
        ${type === 'error' ? '⚠️' : '📡'}
      </div>
      <div class="status-banner__content">
        <div class="status-banner__title">${title}</div>
        <div class="status-banner__message">${message}</div>
      </div>
      <button class="status-banner__close" aria-label="Close">×</button>
    `;

    // Add styles
    this.addBannerStyles();

    // Add close handler
    const closeBtn = banner.querySelector('.status-banner__close');
    closeBtn?.addEventListener('click', () => this.removeStatusBanner());

    document.body.appendChild(banner);
    this.statusBanner = banner;
  }

  /**
   * Remove status banner
   */
  private removeStatusBanner(): void {
    if (this.statusBanner) {
      this.statusBanner.remove();
      this.statusBanner = null;
    }
  }

  /**
   * Add banner styles
   */
  private addBannerStyles(): void {
    if (document.getElementById('graceful-banner-styles')) return;

    const style = document.createElement('style');
    style.id = 'graceful-banner-styles';
    style.textContent = `
      .status-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        padding: 12px 16px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      .status-banner--warning {
        background: #fff3cd;
        color: #856404;
      }
      .status-banner--error {
        background: #f8d7da;
        color: #721c24;
      }
      .status-banner__icon {
        margin-right: 12px;
        font-size: 20px;
      }
      .status-banner__content {
        flex: 1;
      }
      .status-banner__title {
        font-weight: 600;
      }
      .status-banner__message {
        font-size: 12px;
        opacity: 0.9;
      }
      .status-banner__close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0 8px;
        opacity: 0.7;
      }
      .status-banner__close:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Enable all features
   */
  private enableAllFeatures(): void {
    for (const [key, config] of Object.entries(FEATURE_CONFIG)) {
      this.setFeatureState(key, true, config);
    }
  }

  /**
   * Disable non-critical features
   */
  private disableNonCriticalFeatures(): void {
    for (const [key, config] of Object.entries(FEATURE_CONFIG)) {
      if (!config.critical) {
        this.setFeatureState(key, false, config);
      }
    }
  }

  /**
   * Set feature state
   */
  private setFeatureState(featureKey: string, enabled: boolean, config: FeatureConfig): void {
    const wasEnabled = this.currentFeatures.has(featureKey);
    this.currentFeatures.clear();

    if (enabled) {
      this.currentFeatures.add(featureKey);
    }

    // Notify listeners
    const listener = this.listeners.get(featureKey);
    if (listener) {
      listener(config);
    }

    // Update UI
    this.updateFeatureUI(featureKey, enabled, config);
  }

  /**
   * Update feature UI
   */
  private updateFeatureUI(featureKey: string, enabled: boolean, config: FeatureConfig): void {
    const elements = document.querySelectorAll(`[data-feature="${featureKey}"]`);

    for (const el of elements) {
      if (enabled) {
        el.removeAttribute('disabled');
        el.classList.remove('feature-disabled');
      } else {
        if (config.offlineBehavior === 'disabled') {
          el.setAttribute('disabled', 'true');
          el.classList.add('feature-disabled');
        }
      }
    }
  }

  /**
   * Check if feature is available
   */
  isFeatureAvailable(featureKey: string): boolean {
    return this.currentFeatures.has(featureKey);
  }

  /**
   * Get feature config
   */
  getFeatureConfig(featureKey: string): FeatureConfig | undefined {
    return FEATURE_CONFIG[featureKey];
  }

  /**
   * Register feature listener
   */
  onFeatureChange(featureKey: string, listener: (config: FeatureConfig) => void): void {
    this.listeners.set(featureKey, listener);
  }

  /**
   * Queue action for later sync
   */
  async queueAction(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    entity: string,
    entityId: string,
    data: unknown
  ): Promise<void> {
    await localDatabase.addToSyncQueue({
      action,
      entity,
      entityId,
      data,
    });
    console.log('[GRACEFUL] Action queued:', action, entity, entityId);
  }

  /**
   * Sync queued actions
   */
  private async syncQueuedActions(): Promise<void> {
    const state = degradedModeManager.getState();
    if (state !== ConnectionState.ONLINE) {
      console.log('[GRACEFUL] Skipping sync - not online');
      return;
    }

    try {
      const result = await localDatabase.processSyncQueue({
        post: async (url: string, data: unknown) => {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        },
        put: async (url: string, data: unknown) => {
          const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        },
        delete: async (url: string) => {
          const res = await fetch(url, { method: 'DELETE' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        },
      });

      console.log('[GRACEFUL] Sync result:', result);
    } catch (err) {
      console.error('[GRACEFUL] Sync failed:', err);
    }
  }

  /**
   * Show read-only notice for cached data
   */
  showReadOnlyNotice(): void {
    const notice = document.createElement('div');
    notice.className = 'read-only-notice';
    notice.textContent = 'Viewing cached data - changes will sync when online';
    notice.style.cssText = `
      position: fixed;
      bottom: 16px;
      left: 16px;
      right: 16px;
      padding: 8px 16px;
      background: #e7f3ff;
      color: #004085;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
    `;
    document.body.appendChild(notice);

    setTimeout(() => notice.remove(), 5000);
  }
}

// Export singleton
export const gracefulDegradation = GracefulDegradationHandler.getInstance();

// Export for CommonJS
export { GracefulDegradationHandler };