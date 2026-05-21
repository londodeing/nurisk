/**
 * Dependency Resolver
 * ==============
 * DAG-based dependency resolution for playbook steps
 */

import { PlaybookStepWithDeps } from './models';

interface DAGNode {
  step: PlaybookStepWithDeps;
  dependencies: Set<number>;
  dependents: Set<number>;
}

export class DependencyResolver {
  private nodes: Map<number, DAGNode> = new Map();

  /**
   * Build DAG from steps with dependencies
   */
  buildDAG(steps: PlaybookStepWithDeps[]): void {
    this.nodes.clear();

    // Create nodes
    for (const step of steps) {
      this.nodes.set(step.order, {
        step,
        dependencies: new Set(step.depends_on || []),
        dependents: new Set(),
      });
    }

    // Build edges
    for (const step of steps) {
      for (const depId of step.depends_on || []) {
        const depNode = this.nodes.get(depId);
        if (depNode) {
          depNode.dependents.add(step.order);
        }
      }
    }
  }

  /**
   * Detect circular dependencies using DFS
   */
  detectCycles(): boolean {
    const visited = new Set<number>();
    const recursionStack = new Set<number>();

    const dfs = (nodeId: number): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (!node) return false;

      for (const depId of node.dependencies) {
        if (!visited.has(depId)) {
          if (dfs(depId)) return true;
        } else if (recursionStack.has(depId)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (dfs(nodeId)) return true;
      }
    }

    return false;
  }

  /**
   * Get execution order (topological sort)
   * Returns array of arrays - each array contains steps that can run in parallel
   */
  getExecutionOrder(): number[][] {
    const inDegree = new Map<number, number>();
    const adjacency = new Map<number, Set<number>>();

    // Initialize
    for (const [nodeId, node] of this.nodes) {
      inDegree.set(nodeId, node.dependencies.size);
      adjacency.set(nodeId, node.dependents);
    }

    const result: number[][] = [];
    const visited = new Set<number>();

    while (visited.size < this.nodes.size) {
      // Find nodes with no incoming edges
      const ready: number[] = [];
      for (const [nodeId, degree] of inDegree) {
        if (!visited.has(nodeId) && degree === 0) {
          ready.push(nodeId);
        }
      }

      if (ready.length === 0 && visited.size < this.nodes.size) {
        throw new Error('Circular dependency detected');
      }

      // Sort by order
      ready.sort((a, b) => a - b);
      result.push(ready);

      // Mark as visited and update degrees
      for (const nodeId of ready) {
        visited.add(nodeId);
        const dependents = adjacency.get(nodeId);
        if (dependents) {
          for (const dep of dependents) {
            const currentDegree = inDegree.get(dep);
            if (currentDegree !== undefined) {
              inDegree.set(dep, currentDegree - 1);
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Check if a step can run given completed steps
   */
  canRun(stepOrder: number, completedSteps: Set<number>): boolean {
    const node = this.nodes.get(stepOrder);
    if (!node) return false;

    for (const depId of node.dependencies) {
      if (!completedSteps.has(depId)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get steps that can run in parallel at current state
   */
  getRunnableSteps(completedSteps: Set<number>): number[] {
    const runnable: number[] = [];

    for (const [nodeId, node] of this.nodes) {
      if (completedSteps.has(nodeId)) continue;

      if (this.canRun(nodeId, completedSteps)) {
        runnable.push(nodeId);
      }
    }

    return runnable.sort((a, b) => a - b);
  }
}

/**
 * Validate playbook steps for circular dependencies
 */
export function validateDependencies(steps: PlaybookStepWithDeps[]): { valid: boolean; error?: string } {
  if (steps.length === 0) {
    return { valid: true };
  }

  const resolver = new DependencyResolver();
  resolver.buildDAG(steps);

  if (resolver.detectCycles()) {
    return { valid: false, error: 'Circular dependency detected in playbook steps' };
  }

  return { valid: true };
}