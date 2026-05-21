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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildingsRepository = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
let BuildingsRepository = class BuildingsRepository {
    pool;
    constructor(pool = pool) {
        this.pool = pool;
    }
    async create(data) {
        const result = await this.pool.query(`INSERT INTO building_assessments 
       (user_id, name, address, region, district, village, latitude, longitude, imb, slf, struktur, non_struktural, odnk, ibu_hamil, lansia, balita, fasilitas, peralatan, dana_darurat, anggaran, asuransi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING *`, [
            data.user_id,
            data.name,
            data.address,
            data.region,
            data.district,
            data.village,
            data.latitude,
            data.longitude,
            data.imb?.toString(),
            data.slf?.toString(),
            data.struktur,
            data.non_struktural,
            data.odnk?.toString(),
            data.ibu_hamil?.toString(),
            data.lansia?.toString(),
            data.balita?.toString(),
            JSON.stringify(data.fasilitas || []),
            JSON.stringify(data.peralatan || []),
            data.dana_darurat,
            data.anggaran,
            data.asuransi,
        ]);
        return result.rows[0];
    }
    async findById(id) {
        const result = await this.pool.query('SELECT * FROM building_assessments WHERE id = $1', [id]);
        return result.rows[0];
    }
    async findAll(filters = {}, options) {
        const { region, struktur, search } = filters;
        const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = options;
        let whereClause = 'WHERE 1=1';
        const params = [];
        let paramIndex = 1;
        if (region) {
            whereClause += ` AND LOWER(region) LIKE LOWER($${paramIndex})`;
            params.push(`%${region}%`);
            paramIndex++;
        }
        if (struktur) {
            whereClause += ` AND struktur = $${paramIndex}`;
            params.push(struktur);
            paramIndex++;
        }
        if (search) {
            whereClause += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(address) LIKE LOWER($${paramIndex}))`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        const countResult = await this.pool.query(`SELECT COUNT(*) FROM building_assessments ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count, 10);
        const offset = (page - 1) * limit;
        const dataResult = await this.pool.query(`SELECT * FROM building_assessments ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, limit, offset]);
        const totalPages = Math.ceil(total / limit);
        return {
            items: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    async update(id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        if (fields.length === 0) {
            return this.findById(id);
        }
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        const result = await this.pool.query(`UPDATE building_assessments SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, ...values]);
        return result.rows[0];
    }
    async delete(id) {
        await this.pool.query('DELETE FROM building_assessments WHERE id = $1', [id]);
    }
    async findByRegion(region) {
        const result = await this.pool.query('SELECT * FROM building_assessments WHERE LOWER(region) LIKE LOWER($1) ORDER BY created_at DESC', [`%${region}%`]);
        return result.rows;
    }
};
exports.BuildingsRepository = BuildingsRepository;
exports.BuildingsRepository = BuildingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [pg_1.Pool])
], BuildingsRepository);
//# sourceMappingURL=buildings.repository.js.map