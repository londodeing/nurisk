/**
 * Decision Module Registry
 * ================
 * Manages dynamic registration and execution of decision modules
 */

/**
 * DecisionModuleRegistry - Manages decision modules
 */
class DecisionModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.logger = console;
  }

  /**
   * Register a decision module
   * @param {Object} module - Module with name, version, evaluate function
   */
  register(module) {
    if (!module || !module.name || !module.evaluate) {
      throw new Error('Invalid module: must have name and evaluate function');
    }

    const { name, version = '1.0.0' } = module;
    const key = `${name}@${version}`;

    if (this.modules.has(key)) {
      this.logger.log(`[DecisionModuleRegistry] Overwriting existing module: ${key}`);
    }

    this.modules.set(key, {
      name,
      version,
      evaluate: module.evaluate.bind(module)
    });

    this.logger.log(`[DecisionModuleRegistry] Registered module: ${key}`);
  }

  /**
   * Unregister a decision module
   * @param {string} name - Module name
   * @param {string} [version] - Module version
   */
  unregister(name, version = '1.0.0') {
    const key = `${name}@${version}`;
    const removed = this.modules.delete(key);
    
    if (removed) {
      this.logger.log(`[DecisionModuleRegistry] Unregistered module: ${key}`);
    }
    
    return removed;
  }

  /**
   * Get a specific module
   * @param {string} name - Module name
   * @param {string} [version] - Module version
   */
  get(name, version = '1.0.0') {
    const key = `${name}@${version}`;
    return this.modules.get(key);
  }

  /**
   * Get all registered modules
   * @returns {Array}
   */
  getAll() {
    return Array.from(this.modules.values());
  }

  /**
   * Check if a module is registered
   * @param {string} name - Module name
   * @param {string} [version] - Module version
   */
  has(name, version = '1.0.0') {
    const key = `${name}@${version}`;
    return this.modules.has(key);
  }

  /**
   * Evaluate all registered modules in parallel
   * @param {Object} context - Input context
   * @returns {Promise<Array>} Merged decisions from all modules
   */
  async evaluateAll(context) {
    const modules = this.getAll();
    
    if (modules.length === 0) {
      this.logger.log('[DecisionModuleRegistry] No modules registered, returning empty decisions');
      return [];
    }

    this.logger.log(`[DecisionModuleRegistry] Evaluating ${modules.length} modules in parallel`);

    // Execute all modules in parallel
    const results = await Promise.all(
      modules.map(async (module) => {
        try {
          const decisions = await module.evaluate(context);
          return decisions || [];
        } catch (err) {
          // Module failure is isolated - log and continue
          this.logger.error(`[DecisionModuleRegistry] Module ${module.name} failed:`, err.message);
          return [];
        }
      })
    );

    // Merge all decisions
    const merged = results.flat();
    
    this.logger.log(`[DecisionModuleRegistry] Merged ${merged.length} decisions from ${modules.length} modules`);
    
    return merged;
  }

  /**
   * Evaluate modules sequentially (for ordered dependencies)
   * @param {Object} context - Input context
   * @param {string[]} [order] - Ordered module names
   * @returns {Promise<Array>} Merged decisions
   */
  async evaluateSequential(context, order = []) {
    const modules = this.getAll();
    const merged = [];

    for (const module of modules) {
      try {
        const decisions = await module.evaluate(context);
        if (decisions) {
          merged.push(...decisions);
        }
      } catch (err) {
        this.logger.error(`[DecisionModuleRegistry] Module ${module.name} failed:`, err.message);
      }
    }

    return merged;
  }

  /**
   * Clear all modules
   */
  clear() {
    const count = this.modules.size;
    this.modules.clear();
    this.logger.log(`[DecisionModuleRegistry] Cleared ${count} modules`);
  }

  /**
   * Get module count
   * @returns {number}
   */
  size() {
    return this.modules.size;
  }
}

// Export singleton instance
const decisionModuleRegistry = new DecisionModuleRegistry();

module.exports = {
  DecisionModuleRegistry,
  decisionModuleRegistry
};