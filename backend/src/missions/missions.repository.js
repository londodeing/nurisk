"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../config/database");
let MissionsRepository = class MissionsRepository {
    databaseService;
    pool;
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.pool = this.databaseService.getPool();
    }
    async create(data) {
        const result = await this.pool.query(`INSERT INTO missions (name, description, incident_id, status, priority, region, start_date, end_date, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [
            data.name,
            data.description,
            data.incident_id,
            data.status || 'pending',
            data.priority,
            data.region,
            data.start_date,
            data.end_date,
            data.capacity,
        ]);
        return result.rows[0];
    }
    async findAll(filters) {
        let query = `SELECT * FROM missions WHERE deleted_at IS NULL`;
        const params = [];
        let paramIndex = 1;
        if (filters.incidentId) {
            params.push(filters.incidentId);
            query += ` AND incident_id = ${paramIndex++}`;
        }
        if (filters.status) {
            params.push(filters.status);
            query += ` AND status = ${paramIndex++}`;
        }
        query += ` ORDER BY created_at DESC`;
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    async findById(id) {
        const result = await this.pool.query(`SELECT * FROM missions WHERE id = $1 AND deleted_at IS NULL`, [id]);
        return result.rows[0] || null;
    }
    async update(id, data) {
        const updates = [];
        const params = [];
        let paramIndex = 1;
        const fields = ['name', 'description', 'incident_id', 'status', 'priority', 'region', 'start_date', 'end_date', 'capacity'];
        for (const field of fields) {
            if (data[field] !== undefined) {
                params.push(data[field]);
                updates.push(`${field} = $${paramIndex++}`);
            }
        }
        if (updates.length === 0) {
            return this.findById(id);
        }
        params.push(id);
        const result = await this.pool.query(`UPDATE missions SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`, params);
        return result.rows[0] || null;
    }
    async delete(id) {
        const result = await this.pool.query(`UPDATE missions SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`, [id]);
        return result.rows.length > 0;
    }
    async deployVolunteer(missionId, volunteerId) {
        const mission = await this.findById(missionId);
        if (!mission) {
            throw new Error('Mission not found');
        }
        // Check capacity
        const countResult = await this.pool.query(`SELECT COUNT(*) as count FROM volunteer_deployments WHERE mission_id = $1 AND status = 'ACTIVE'`, [missionId]);
        const deployed = parseInt(countResult.rows[0]?.count || '0', 10);
        if (mission.capacity && deployed >= mission.capacity) {
            throw new Error('Mission capacity reached');
        }
        const result = await this.pool.query(`INSERT INTO volunteer_deployments (volunteer_id, mission_id, status, deployed_at)
       VALUES ($1, $2, 'ACTIVE', NOW()) RETURNING *`, [volunteerId, missionId]);
        return result.rows[0];
    }
    async recallVolunteer(missionId, volunteerId) {
        const result = await this.pool.query(`UPDATE volunteer_deployments SET status = 'RECALLED', recalled_at = NOW()
       WHERE mission_id = $1 AND volunteer_id = $2 AND status = 'ACTIVE' RETURNING *`, [missionId, volunteerId]);
        if (result.rows.length === 0) {
            throw new Error('Active deployment not found');
        }
        return result.rows[0];
    }
    async getDeployments(missionId) {
        const result = await this.pool.query(`SELECT * FROM volunteer_deployments WHERE mission_id = $1 ORDER BY deployed_at DESC`, [missionId]);
        return result.rows;
    }
};
exports.MissionsRepository = MissionsRepository;
exports.MissionsRepository = MissionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.DatabaseService])
], MissionsRepository);
//# sourceMappingURL=missions.repository.js.map