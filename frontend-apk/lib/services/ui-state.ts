/**
 * UI State Restoration Service
 * ===================
 * Handles UI state preservation and restoration
 */

export interface UIState {
  currentPath: string;
  scrollPosition: number;
  formDrafts: Record<string, Record<string, unknown>>;
  expandedSections: Record<string, boolean>;
  filterState: Record<string, unknown>;
  timestamp: number;
}

const STATE_KEY = 'nurisk_ui_state';

/**
 * UI State Restoration Service
 */
export class UIStateService {
  private state: UIState;
  private saveTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.state = this.loadState();
  }

  /**
   * Save current path
   */
  saveCurrentPath(path: string): void {
    this.state.currentPath = path;
    this.state.timestamp = Date.now();
    this.debouncedSave();
  }

  /**
   * Save scroll position
   */
  saveScrollPosition(position: number): void {
    this.state.scrollPosition = position;
    this.state.timestamp = Date.now();
    this.debouncedSave();
  }

  /**
   * Save form draft
   */
  saveFormDraft(formId: string, data: Record<string, unknown>): void {
    this.state.formDrafts[formId] = data;
    this.state.timestamp = Date.now();
    this.debouncedSave();
  }

  /**
   * Get form draft
   */
  getFormDraft(formId: string): Record<string, unknown> | null {
    return this.state.formDrafts[formId] || null;
  }

  /**
   * Clear form draft
   */
  clearFormDraft(formId: string): void {
    delete this.state.formDrafts[formId];
    this.state.timestamp = Date.now();
    this.debouncedSave();
  }

  /**
   * Save expanded section state
   */
  saveExpandedSection(sectionId: string, expanded: boolean): void {
    this.state.expandedSections[sectionId] = expanded;
    this.state.timestamp = Date.now();
    this.debouncedSave();
  }

  /**
   * Get expanded section state
   */
  isExpanded(sectionId: string): boolean {
    return this.state.expandedSections[sectionId] ?? false;
  }

  /**
   * Save filter state
   */
  saveFilterState(filterId: string, state: Record<string, unknown>): void {
    this.state.filterState[filterId] = state;
    this.state.timestamp = Date.now();
    this.debouncedSave();
  }

  /**
   * Get filter state
   */
  getFilterState(filterId: string): Record<string, unknown> | null {
    return this.state.filterState[filterId] || null;
  }

  /**
   * Restore UI state
   */
  restore(): {
    path: string;
    scrollPosition: number;
    formDrafts: Record<string, Record<string, unknown>>;
    expandedSections: Record<string, boolean>;
    filterState: Record<string, unknown>;
  } | null {
    // Check if state is recent (within 30 minutes)
    const maxAge = 30 * 60 * 1000;
    if (Date.now() - this.state.timestamp > maxAge) {
      return null;
    }

    return {
      path: this.state.currentPath,
      scrollPosition: this.state.scrollPosition,
      formDrafts: this.state.formDrafts,
      expandedSections: this.state.expandedSections,
      filterState: this.state.filterState,
    };
  }

  /**
   * Clear all state
   */
  clear(): void {
    this.state = {
      currentPath: '',
      scrollPosition: 0,
      formDrafts: {},
      expandedSections: {},
      filterState: {},
      timestamp: Date.now(),
    };
    this.saveState();
  }

  /**
   * Load state from session storage
   */
  private loadState(): UIState {
    try {
      const stored = sessionStorage.getItem(STATE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }

    return {
      currentPath: '',
      scrollPosition: 0,
      formDrafts: {},
      expandedSections: {},
      filterState: {},
      timestamp: Date.now(),
    };
  }

  /**
   * Save state to session storage
   */
  private saveState(): void {
    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Debounced save
   */
  private debouncedSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.saveState();
    }, 500);
  }
}

// Export for CommonJS
export { UIStateService };