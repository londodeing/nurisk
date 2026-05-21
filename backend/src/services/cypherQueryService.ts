import { Injectable, Logger } from '@nestjs/common';
import pool from '../config/database';

export interface GraphNode {
  id: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphRelationship {
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphPath {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  length: number;
}

export interface SimilarityResult {
  id: string;
  type: string;
  score: number;
}

@Injectable()
export class CypherQueryService {
  private readonly logger = new Logger(CypherQueryService.name);

  /**
   * Find entity relationships
   */
  async findRelationships(
    entityId: string,
    depth = 2
  ): Promise<{ nodes: GraphNode[]; relationships: GraphRelationship[] }> {
    const nodes: GraphNode[] = [];
    const relationships: GraphRelationship[] = [];

    try {
      // Get direct relationships
      const result = await pool.query(`
        SELECT 
          e1.id as source_id,
          e1.entity_type as source_type,
          e1.properties as source_properties,
          e2.id as target_id,
          e2.entity_type as target_type,
          e2.properties as target_properties,
          r.relationship_type
        FROM entity_relationships r
        JOIN entities e1 ON e1.id = r.source_id
        JOIN entities e2 ON e2.id = r.target_id
        WHERE r.source_id = $1 OR r.target_id = $1
      `, [entityId]);

      for (const row of result.rows) {
        const sourceNode: GraphNode = {
          id: row.source_id,
          type: row.source_type,
          properties: row.source_properties || {},
        };
        const targetNode: GraphNode = {
          id: row.target_id,
          type: row.target_type,
          properties: row.target_properties || {},
        };

        if (!nodes.find((n) => n.id === sourceNode.id)) {
          nodes.push(sourceNode);
        }
        if (!nodes.find((n) => n.id === targetNode.id)) {
          nodes.push(targetNode);
        }

        relationships.push({
          source: row.source_id,
          target: row.target_id,
          type: row.relationship_type,
          properties: {},
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to find relationships: ${error}`);
    }

    return { nodes, relationships };
  }

  /**
   * Find path between entities
   */
  async findPath(
    sourceId: string,
    targetId: string,
    maxDepth = 4
  ): Promise<GraphPath[]> {
    const paths: GraphPath[] = [];

    try {
      // Use recursive CTE for path finding
      const result = await pool.query(`
        WITH RECURSIVE path_finding AS (
          -- Base case: start from source
          SELECT 
            ARRAY[e.source_id, e.target_id] as path,
            1 as depth,
            e.relationship_type as rel_type
          FROM entity_relationships e
          WHERE e.source_id = $1
          
          UNION ALL
          
          -- Recursive case
          SELECT 
            p.path || e.target_id,
            p.depth + 1,
            e.relationship_type
          FROM path_finding p
          JOIN entity_relationships e ON e.source_id = p.path[array_upper(p.path, 1)]
          WHERE p.depth < $3
            AND NOT e.target_id = ANY(p.path)
        )
        SELECT path, depth, rel_type
        FROM path_finding
        WHERE path[array_upper(path, 1)] = $2
        LIMIT 10
      `, [sourceId, targetId, maxDepth]);

      for (const row of result.rows) {
        const pathArray = row.path as string[];
        const nodes: GraphNode[] = [];
        const relationships: GraphRelationship[] = [];

        for (let i = 0; i < pathArray.length; i++) {
          const nodeResult = await pool.query(
            `SELECT id, entity_type, properties FROM entities WHERE id = $1`,
            [pathArray[i]]
          );

          if (nodeResult.rows.length > 0) {
            nodes.push({
              id: nodeResult.rows[0].id,
              type: nodeResult.rows[0].entity_type,
              properties: nodeResult.rows[0].properties || {},
            });
          }

          if (i < pathArray.length - 1) {
            relationships.push({
              source: pathArray[i],
              target: pathArray[i + 1],
              type: row.rel_type,
              properties: {},
            });
          }
        }

        paths.push({
          nodes,
          relationships,
          length: row.depth,
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to find path: ${error}`);
    }

    return paths;
  }

  /**
   * Find similar entities
   */
  async findSimilar(
    entityId: string,
    limit = 10
  ): Promise<SimilarityResult[]> {
    const results: SimilarityResult[] = [];

    try {
      // Get source entity properties
      const sourceResult = await pool.query(
        `SELECT entity_type, properties FROM entities WHERE id = $1`,
        [entityId]
      );

      if (sourceResult.rows.length === 0) {
        return results;
      }

      const sourceType = sourceResult.rows[0].entity_type;
      const sourceProps = sourceResult.rows[0].properties || {};

      // Find entities of same type with similar properties
      const result = await pool.query(`
        SELECT 
          id,
          entity_type,
          properties,
          (
            SELECT COUNT(*)
            FROM jsonb_object_keys($1) k
            WHERE properties->>k = $1->>k
          ) as matching_properties
        FROM entities
        WHERE id != $2
          AND entity_type = $3
        ORDER BY matching_properties DESC
        LIMIT $4
      `, [JSON.stringify(sourceProps), entityId, sourceType, limit]);

      for (const row of result.rows) {
        const matchingCount = parseInt(row.matching_properties);
        const totalKeys = Object.keys(sourceProps).length;
        const score = totalKeys > 0 ? (matchingCount / totalKeys) * 100 : 0;

        results.push({
          id: row.id,
          type: row.entity_type,
          score: Math.round(score),
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to find similar: ${error}`);
    }

    return results;
  }

  /**
   * Get entity by ID
   */
  async getEntity(entityId: string): Promise<GraphNode | null> {
    try {
      const result = await pool.query(
        `SELECT id, entity_type, properties FROM entities WHERE id = $1`,
        [entityId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return {
        id: result.rows[0].id,
        type: result.rows[0].entity_type,
        properties: result.rows[0].properties || {},
      };
    } catch (error) {
      this.logger.warn(`Failed to get entity: ${error}`);
      return null;
    }
  }

  /**
   * Query entities by type
   */
  async queryByType(
    entityType: string,
    limit = 100
  ): Promise<GraphNode[]> {
    try {
      const result = await pool.query(`
        SELECT id, entity_type, properties
        FROM entities
        WHERE entity_type = $1
        LIMIT $2
      `, [entityType, limit]);

      return result.rows.map((row) => ({
        id: row.id,
        type: row.entity_type,
        properties: row.properties || {},
      }));
    } catch (error) {
      this.logger.warn(`Failed to query by type: ${error}`);
      return [];
    }
  }

  /**
   * Create entity
   */
  async createEntity(
    type: string,
    properties: Record<string, any>
  ): Promise<GraphNode> {
    const id = `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await pool.query(`
      INSERT INTO entities (id, entity_type, properties, created_at)
      VALUES ($1, $2, $3, NOW())
    `, [id, type, JSON.stringify(properties)]);

    return { id, type, properties };
  }

  /**
   * Create relationship
   */
  async createRelationship(
    sourceId: string,
    targetId: string,
    type: string,
    properties: Record<string, any> = {}
  ): Promise<GraphRelationship> {
    await pool.query(`
      INSERT INTO entity_relationships (source_id, target_id, relationship_type, properties, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [sourceId, targetId, type, JSON.stringify(properties)]);

    return { source: sourceId, target: targetId, type, properties };
  }
}