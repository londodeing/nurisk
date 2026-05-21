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
exports.LogisticsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../config/database");
let LogisticsRepository = class LogisticsRepository {
    databaseService;
    pool;
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.pool = this.databaseService.getPool();
    }
    async create(data) {
        const result = await this.pool.query(`INSERT INTO logistics_requests (incident_id, item_name, quantity_requested, requester_region, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`, [
            data.incident_id,
            data.item_name,
            data.quantity_requested,
            data.requester_region,
        ]);
        return result.rows[0];
    }
    async findAll(filters) {
        let query = `SELECT * FROM logistics_requests WHERE 1=1`;
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
        const result = await this.pool.query(`SELECT * FROM logistics_requests WHERE id = $1`, [id]);
        return result.rows[0] || null;
    }
    async updateStatus(id, status, adminNote) {
        const result = await this.pool.query(`UPDATE logistics_requests SET status = $1, admin_note = COALESCE($2, admin_note), updated_at = NOW() WHERE id = $2 RETURNING *`, [status, adminNote, id]);
        return result.rows[0] || null;
    }
    async approve(id, approvedBy) {
        const result = await this.pool.query(`UPDATE logistics_requests SET status = 'APPROVED', approved_by = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [approvedBy, id]);
        return result.rows[0] || null;
    }
    async reject(id, reason) {
        const result = await this.pool.query(`UPDATE logistics_requests SET status = 'REJECTED', admin_note = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [reason, id]);
        return result.rows[0] || null;
    }
    async fulfill(id, items, fulfilledBy) {
        // Process each item
        for (const item of items) {
            await this.pool.query(`INSERT INTO asset_transactions (asset_id, quantity, type, status, performed_by, notes)
         VALUES ($1, $2, 'CHECKOUT', 'COMPLETED', $3, $4)`, [item.inventory_id, item.quantity, fulfilledBy, `Fulfillment for request ${id}`]);
            await this.pool.query(`UPDATE asset_inventories SET quantity = quantity - $1 WHERE id = $2`, [item.quantity, item.inventory_id]);
        }
        // Get request to check fulfillment
        const request = await this.findById(id);
        if (!request)
            return null;
        const totalFulfilled = items.reduce((sum, item) => sum + item.quantity, 0);
        const newStatus = totalFulfilled >= (request.quantity_requested || 0) ? 'FULFILLED' : 'PARTIALLY_FULFILLED';
        const result = await this.pool.query(`UPDATE logistics_requests SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [newStatus, id]);
        return result.rows[0] || null;
    }
};
exports.LogisticsRepository = LogisticsRepository;
exports.LogisticsRepository = LogisticsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.DatabaseService])
], LogisticsRepository);
//# sourceMappingURL=logistics.repository.js.map