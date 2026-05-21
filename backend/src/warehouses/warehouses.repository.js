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
exports.WarehousesRepository = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../config/database");
let WarehousesRepository = class WarehousesRepository {
    databaseService;
    pool;
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.pool = this.databaseService.getPool();
    }
    async create(data) {
        const result = await this.pool.query(`INSERT INTO warehouses (name, type, region, address, latitude, longitude, contact_person, phone, email, operating_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`, [
            data.name,
            data.type,
            data.region,
            data.address,
            data.latitude,
            data.longitude,
            data.contact_person,
            data.phone,
            data.email,
            data.operating_hours,
        ]);
        return result.rows[0];
    }
    async findAll(filters) {
        let query = `SELECT * FROM warehouses WHERE deleted_at IS NULL`;
        const params = [];
        let paramIndex = 1;
        if (filters.type) {
            params.push(filters.type);
            query += ` AND type = $${paramIndex++}`;
        }
        if (filters.region) {
            params.push(filters.region);
            query += ` AND region = $${paramIndex++}`;
        }
        if (filters.status) {
            params.push(filters.status);
            query += ` AND status = $${paramIndex++}`;
        }
        query += ` ORDER BY created_at DESC`;
        const result = await this.pool.query(query, params);
        return result.rows;
    }
    async findById(id) {
        const result = await this.pool.query(`SELECT * FROM warehouses WHERE id = $1 AND deleted_at IS NULL`, [id]);
        return result.rows[0] || null;
    }
    async update(id, data) {
        const updates = [];
        const params = [];
        let paramIndex = 1;
        const fields = ['name', 'type', 'region', 'address', 'latitude', 'longitude', 'contact_person', 'phone', 'email', 'operating_hours', 'status'];
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
        const result = await this.pool.query(`UPDATE warehouses SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`, params);
        return result.rows[0] || null;
    }
    async delete(id) {
        const result = await this.pool.query(`UPDATE warehouses SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`, [id]);
        return result.rows.length > 0;
    }
};
exports.WarehousesRepository = WarehousesRepository;
exports.WarehousesRepository = WarehousesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.DatabaseService])
], WarehousesRepository);
//# sourceMappingURL=warehouses.repository.js.map