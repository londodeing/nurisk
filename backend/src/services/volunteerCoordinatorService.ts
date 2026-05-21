import { Injectable, Logger } from '@nestjs/common';
import pool from '../config/database';

export interface Volunteer {
  id: string;
  name: string;
  skills: string[];
  availability: AvailabilitySlot[];
  location: { lat: number; lng: number };
  status: 'available' | 'deployed' | 'unavailable';
  rating: number;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}

export interface Deployment {
  volunteerId: string;
  incidentId: string;
  assignedAt: Date;
  status: 'pending' | 'accepted' | 'completed';
}

export interface SkillMatch {
  volunteer: Volunteer;
  matchScore: number;
  distance: number;
}

@Injectable()
export class VolunteerCoordinatorService {
  private readonly logger = new Logger(VolunteerCoordinatorService.name);

  /**
   * Match volunteers to incident
   */
  async matchVolunteers(
    incidentId: string,
    requiredSkills: string[],
    limit = 10
  ): Promise<SkillMatch[]> {
    const matches: SkillMatch[] = [];

    try {
      // Get incident location
      const incidentResult = await pool.query(
        `SELECT location, priority FROM incidents WHERE id = $1`,
        [incidentId]
      );

      if (incidentResult.rows.length === 0) {
        return matches;
      }

      const incidentLocation = incidentResult.rows[0].location;
      const priority = incidentResult.rows[0].priority;

      // Get available volunteers with matching skills
      const result = await pool.query(`
        SELECT 
          v.id,
          v.name,
          v.skills,
          v.location,
          v.status,
          v.rating,
          v.availability,
          (
            SELECT COUNT(*) FROM jsonb_array_elements_text(v.skills) s
            WHERE s = ANY($1)
          ) as matching_skills
        FROM volunteers v
        WHERE v.status = 'available'
          AND v.availability @> $2::jsonb
        ORDER BY matching_skills DESC, v.rating DESC
        LIMIT $3
      `, [requiredSkills, JSON.stringify(requiredSkills), limit]);

      for (const row of result.rows) {
        const skills = row.skills || [];
        const matchingSkills = skills.filter((s: string) => requiredSkills.includes(s)).length;
        const matchScore = requiredSkills.length > 0 
          ? (matchingSkills / requiredSkills.length) * 100 
          : 50;

        const distance = this.calculateDistance(
          incidentLocation,
          row.location
        );

        matches.push({
          volunteer: {
            id: row.id,
            name: row.name,
            skills,
            availability: row.availability || [],
            location: row.location,
            status: row.status,
            rating: row.rating || 0,
          },
          matchScore: Math.round(matchScore),
          distance: Math.round(distance),
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to match volunteers: ${error}`);
    }

    return matches;
  }

  /**
   * Deploy volunteer to incident
   */
  async deployVolunteer(
    volunteerId: string,
    incidentId: string
  ): Promise<Deployment> {
    try {
      // Check volunteer availability
      const volunteerResult = await pool.query(
        `SELECT status FROM volunteers WHERE id = $1`,
        [volunteerId]
      );

      if (volunteerResult.rows.length === 0 || volunteerResult.rows[0].status !== 'available') {
        throw new Error('Volunteer not available');
      }

      // Create deployment
      await pool.query(`
        INSERT INTO volunteer_deployments (volunteer_id, incident_id, status, assigned_at)
        VALUES ($1, $2, 'pending', NOW())
      `, [volunteerId, incidentId]);

      // Update volunteer status
      await pool.query(
        `UPDATE volunteers SET status = 'deployed' WHERE id = $1`,
        [volunteerId]
      );

      return {
        volunteerId,
        incidentId,
        assignedAt: new Date(),
        status: 'pending',
      };
    } catch (error) {
      this.logger.error(`Failed to deploy: ${error}`);
      throw error;
    }
  }

  /**
   * Complete deployment
   */
  async completeDeployment(
    volunteerId: string,
    incidentId: string
  ): Promise<void> {
    await pool.query(`
      UPDATE volunteer_deployments 
      SET status = 'completed', completed_at = NOW()
      WHERE volunteer_id = $1 AND incident_id = $2
    `, [volunteerId, incidentId]);

    await pool.query(
      `UPDATE volunteers SET status = 'available' WHERE id = $1`,
      [volunteerId]
    );
  }

  /**
   * Get volunteer availability
   */
  async getAvailability(volunteerId: string): Promise<AvailabilitySlot[]> {
    const result = await pool.query(
      `SELECT availability FROM volunteers WHERE id = $1`,
      [volunteerId]
    );

    return result.rows[0]?.availability || [];
  }

  /**
   * Update availability
   */
  async updateAvailability(
    volunteerId: string,
    availability: AvailabilitySlot[]
  ): Promise<void> {
    await pool.query(
      `UPDATE volunteers SET availability = $1 WHERE id = $2`,
      [JSON.stringify(availability), volunteerId]
    );
  }

  /**
   * Get active deployments
   */
  async getActiveDeployments(volunteerId?: string): Promise<Deployment[]> {
    const query = volunteerId
      ? `SELECT * FROM volunteer_deployments WHERE volunteer_id = $1 AND status = 'pending'`
      : `SELECT * FROM volunteer_deployments WHERE status = 'pending'`;

    const result = await pool.query(query, volunteerId ? [volunteerId] : []);

    return result.rows.map((row) => ({
      volunteerId: row.volunteer_id,
      incidentId: row.incident_id,
      assignedAt: row.assigned_at,
      status: row.status,
    }));
  }

  /**
   * Optimize deployment
   */
  async optimizeDeployment(
    incidentId: string,
    requiredSkills: string[]
  ): Promise<{ volunteers: string[]; estimatedTime: number }> {
    const matches = await this.matchVolunteers(incidentId, requiredSkills, 5);

    // Sort by match score and distance
    matches.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.distance - b.distance;
    });

    const volunteerIds = matches.map((m) => m.volunteer.id);
    const estimatedTime = matches.length > 0 
      ? Math.max(...matches.map((m) => m.distance * 2)) // ~2 min/km
      : 0;

    return {
      volunteers: volunteerIds,
      estimatedTime: Math.round(estimatedTime),
    };
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLng = this.toRad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) *
        Math.cos(this.toRad(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}