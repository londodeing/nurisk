"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var VolunteerCoordinatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolunteerCoordinatorService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = __importDefault(require("../config/database"));
let VolunteerCoordinatorService = VolunteerCoordinatorService_1 = class VolunteerCoordinatorService {
    logger = new common_1.Logger(VolunteerCoordinatorService_1.name);
    /**
     * Match volunteers to incident
     */
    async matchVolunteers(incidentId, requiredSkills, limit = 10) {
        const matches = [];
        try {
            // Get incident location
            const incidentResult = await database_1.default.query(`SELECT location, priority FROM incidents WHERE id = $1`, [incidentId]);
            if (incidentResult.rows.length === 0) {
                return matches;
            }
            const incidentLocation = incidentResult.rows[0].location;
            const priority = incidentResult.rows[0].priority;
            // Get available volunteers with matching skills
            const result = await database_1.default.query(`
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
                const matchingSkills = skills.filter((s) => requiredSkills.includes(s)).length;
                const matchScore = requiredSkills.length > 0
                    ? (matchingSkills / requiredSkills.length) * 100
                    : 50;
                const distance = this.calculateDistance(incidentLocation, row.location);
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
        }
        catch (error) {
            this.logger.warn(`Failed to match volunteers: ${error}`);
        }
        return matches;
    }
    /**
     * Deploy volunteer to incident
     */
    async deployVolunteer(volunteerId, incidentId) {
        try {
            // Check volunteer availability
            const volunteerResult = await database_1.default.query(`SELECT status FROM volunteers WHERE id = $1`, [volunteerId]);
            if (volunteerResult.rows.length === 0 || volunteerResult.rows[0].status !== 'available') {
                throw new Error('Volunteer not available');
            }
            // Create deployment
            await database_1.default.query(`
        INSERT INTO volunteer_deployments (volunteer_id, incident_id, status, assigned_at)
        VALUES ($1, $2, 'pending', NOW())
      `, [volunteerId, incidentId]);
            // Update volunteer status
            await database_1.default.query(`UPDATE volunteers SET status = 'deployed' WHERE id = $1`, [volunteerId]);
            return {
                volunteerId,
                incidentId,
                assignedAt: new Date(),
                status: 'pending',
            };
        }
        catch (error) {
            this.logger.error(`Failed to deploy: ${error}`);
            throw error;
        }
    }
    /**
     * Complete deployment
     */
    async completeDeployment(volunteerId, incidentId) {
        await database_1.default.query(`
      UPDATE volunteer_deployments 
      SET status = 'completed', completed_at = NOW()
      WHERE volunteer_id = $1 AND incident_id = $2
    `, [volunteerId, incidentId]);
        await database_1.default.query(`UPDATE volunteers SET status = 'available' WHERE id = $1`, [volunteerId]);
    }
    /**
     * Get volunteer availability
     */
    async getAvailability(volunteerId) {
        const result = await database_1.default.query(`SELECT availability FROM volunteers WHERE id = $1`, [volunteerId]);
        return result.rows[0]?.availability || [];
    }
    /**
     * Update availability
     */
    async updateAvailability(volunteerId, availability) {
        await database_1.default.query(`UPDATE volunteers SET availability = $1 WHERE id = $2`, [JSON.stringify(availability), volunteerId]);
    }
    /**
     * Get active deployments
     */
    async getActiveDeployments(volunteerId) {
        const query = volunteerId
            ? `SELECT * FROM volunteer_deployments WHERE volunteer_id = $1 AND status = 'pending'`
            : `SELECT * FROM volunteer_deployments WHERE status = 'pending'`;
        const result = await database_1.default.query(query, volunteerId ? [volunteerId] : []);
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
    async optimizeDeployment(incidentId, requiredSkills) {
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
    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(point2.lat - point1.lat);
        const dLng = this.toRad(point2.lng - point1.lng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(point1.lat)) *
                Math.cos(this.toRad(point2.lat)) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(deg) {
        return deg * (Math.PI / 180);
    }
};
exports.VolunteerCoordinatorService = VolunteerCoordinatorService;
exports.VolunteerCoordinatorService = VolunteerCoordinatorService = VolunteerCoordinatorService_1 = __decorate([
    (0, common_1.Injectable)()
], VolunteerCoordinatorService);
//# sourceMappingURL=volunteerCoordinatorService.js.map