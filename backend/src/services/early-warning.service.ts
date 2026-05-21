import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class EarlyWarningService {
  constructor(private pool: Pool) {}

  readonly SEVERITY_LEVELS = {
    CRITICAL: 'CRITICAL',
    HIGH: 'HIGH',
    MODERATE: 'MODERATE',
    LOW: 'LOW',
  } as const;

  readonly WARNING_SOURCES = {
    BMKG: 'BMKG',
    MAGMA: 'MAGMA',
    BNPB: 'BNPB',
    INTERNAL: 'INTERNAL',
  } as const;

  readonly DELIVERY_CHANNELS = {
    SOCKET: 'websocket',
    FIREBASE: 'firebase',
    EMAIL: 'email',
    SMS: 'sms',
    SIREN: 'siren',
  } as const;

  async createEarlyWarning(data: {
    title: string;
    description?: string;
    severity: string;
    hazard_type: string;
    region: string;
    source: string;
    issued_at?: Date;
    expires_at?: Date;
  }) {
    const result = await this.pool.query(
      `INSERT INTO early_warnings 
       (title, description, severity, hazard_type, region, source, issued_at, expires_at, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
       RETURNING *`,
      [
        data.title,
        data.description,
        data.severity,
        data.hazard_type,
        data.region,
        data.source,
        data.issued_at || new Date(),
        data.expires_at,
      ],
    );

    const warning = result.rows[0];
    await this.routeWarningBySeverity(warning);
    return warning;
  }

  async getEarlyWarnings(filters: {
    region?: string;
    severity?: string;
    hazard_type?: string;
    source?: string;
    status?: string;
  } = {}) {
    let query = 'SELECT * FROM early_warnings WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.region) {
      query += ` AND region = $${paramIndex}`;
      params.push(filters.region);
      paramIndex++;
    }
    if (filters.severity) {
      query += ` AND severity = $${paramIndex}`;
      params.push(filters.severity);
      paramIndex++;
    }
    if (filters.hazard_type) {
      query += ` AND hazard_type = $${paramIndex}`;
      params.push(filters.hazard_type);
      paramIndex++;
    }
    if (filters.source) {
      query += ` AND source = $${paramIndex}`;
      params.push(filters.source);
      paramIndex++;
    }
    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }
    query += ' ORDER BY issued_at DESC';

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getEarlyWarningById(id: number) {
    const result = await this.pool.query('SELECT * FROM early_warnings WHERE id = $1', [id]);
    return result.rows[0];
  }

  async updateEarlyWarning(
    id: number,
    data: Partial<{
      title: string;
      description: string;
      severity: string;
      hazard_type: string;
      region: string;
      source: string;
      issued_at: Date;
      expires_at: Date;
      status: string;
    }>,
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.severity !== undefined) {
      fields.push(`severity = $${paramIndex++}`);
      values.push(data.severity);
    }
    if (data.hazard_type !== undefined) {
      fields.push(`hazard_type = $${paramIndex++}`);
      values.push(data.hazard_type);
    }
    if (data.region !== undefined) {
      fields.push(`region = $${paramIndex++}`);
      values.push(data.region);
    }
    if (data.source !== undefined) {
      fields.push(`source = $${paramIndex++}`);
      values.push(data.source);
    }
    if (data.issued_at !== undefined) {
      fields.push(`issued_at = $${paramIndex++}`);
      values.push(data.issued_at);
    }
    if (data.expires_at !== undefined) {
      fields.push(`expires_at = $${paramIndex++}`);
      values.push(data.expires_at);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await this.pool.query(
      `UPDATE early_warnings SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values,
    );
    return result.rows[0];
  }

  async deleteEarlyWarning(id: number) {
    const result = await this.pool.query('DELETE FROM early_warnings WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  private async routeWarningBySeverity(warning: any) {
    const io = (global as typeof global & { io?: any }).io;
    const { id, severity, region, title, description } = warning;

    try {
      switch (severity) {
        case this.SEVERITY_LEVELS.CRITICAL:
          if (io) {
            io.emit('emergency_alert', {
              warning_id: id,
              title,
              body: description,
              severity,
              region,
              timestamp: new Date().toISOString(),
            });
            io.to(`region:${region}`).emit('emergency_alert', {
              warning_id: id,
              title,
              body: description,
              severity,
              region,
              timestamp: new Date().toISOString(),
            });
          }
          await this.logDelivery(id, this.DELIVERY_CHANNELS.SOCKET, 'broadcast', 'success');
          break;
        case this.SEVERITY_LEVELS.HIGH:
          await this.logDelivery(id, this.DELIVERY_CHANNELS.FIREBASE, 'push', 'pending');
          break;
        case this.SEVERITY_LEVELS.MODERATE:
          await this.logDelivery(id, this.DELIVERY_CHANNELS.EMAIL, 'email', 'pending');
          break;
        case this.SEVERITY_LEVELS.LOW:
          await this.logDelivery(id, this.DELIVERY_CHANNELS.SOCKET, 'logged', 'success');
          break;
      }
    } catch (error) {
      console.error('[EARLY_WARNING] Routing error:', (error as Error).message);
      await this.logDelivery(id, 'unknown', 'failed', (error as Error).message);
    }
  }

  private async logDelivery(
    warningId: number,
    channel: string,
    recipientId: string,
    status: string,
    errorMessage?: string,
  ) {
    const result = await this.pool.query(
      `INSERT INTO warning_delivery_logs 
       (warning_id, channel, recipient_id, status, error_message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [warningId, channel, recipientId, status, errorMessage],
    );
    return result.rows[0];
  }

  async getDeliveryLogs(warningId: number) {
    const result = await this.pool.query(
      `SELECT * FROM warning_delivery_logs WHERE warning_id = $1 ORDER BY created_at DESC`,
      [warningId],
    );
    return result.rows;
  }

  async retryFailedDeliveries(warningId: number) {
    const failedResult = await this.pool.query(
      `SELECT * FROM warning_delivery_logs WHERE warning_id = $1 AND status = 'failed' AND retry_count < 3`,
      [warningId],
    );

    const warning = await this.getEarlyWarningById(warningId);
    if (!warning) return null;

    const results = [];
    for (const log of failedResult.rows) {
      const newRetryCount = log.retry_count + 1;
      try {
        await this.pool.query(
          `UPDATE warning_delivery_logs SET status = 'success', retry_count = $1, delivered_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [newRetryCount, log.id],
        );
        results.push({ channel: log.channel, status: 'success', retry: newRetryCount });
      } catch (error) {
        await this.pool.query(
          `UPDATE warning_delivery_logs SET retry_count = $1, error_message = $2 WHERE id = $3`,
          [newRetryCount, (error as Error).message, log.id],
        );
        results.push({
          channel: log.channel,
          status: 'failed',
          retry: newRetryCount,
          error: (error as Error).message,
        });
      }
    }
    return results;
  }

  async ingestBMKGAlert(bmkgData: any) {
    const severity = this.determineSeverity(bmkgData.magnitude, bmkgData.potensi);
    const hazardType = this.determineHazardType(bmkgData);

    return this.createEarlyWarning({
      title: bmkgData.title || bmkgData.shakemap_id?.replace(/_/g, ' ') || 'BMKG Alert',
      description: bmkgData.description || bmkgData.remarks || '',
      severity,
      hazard_type: hazardType,
      region: bmkgData.region || 'JAWA TENGAH',
      source: this.WARNING_SOURCES.BMKG,
      issued_at: bmkgData.tanggal ? new Date(bmkgData.tanggal + ' ' + bmkgData.jam) : new Date(),
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000),
    });
  }

  async ingestMAGMAAlert(magmaData: any) {
    const severity = this.determineSeverityMagma(magmaData.status);

    return this.createEarlyWarning({
      title: `Gunung Api ${magmaData.gunungapi || 'Alert'}`,
      description: magmaData.remarks || '',
      severity,
      hazard_type: 'Gunung Api',
      region: magmaData.region || 'JAWA TENGAH',
      source: this.WARNING_SOURCES.MAGMA,
      issued_at: new Date(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  async ingestBNPBAlert(bnpbData: any) {
    return this.createEarlyWarning({
      title: bnpbData.title || 'BNPB Alert',
      description: bnpbData.description || '',
      severity: bnpbData.severity || 'MODERATE',
      hazard_type: bnpbData.hazard_type || 'Multi',
      region: bnpbData.region || 'JAWA TENGAH',
      source: this.WARNING_SOURCES.BNPB,
      issued_at: new Date(bnpbData.issued_at),
      expires_at: new Date(bnpbData.expires_at),
    });
  }

  private determineSeverity(magnitude?: string, potensi?: string) {
    const mag = parseFloat(magnitude || '0');
    if (mag >= 7.0 || potensi?.includes('tsunami')) return this.SEVERITY_LEVELS.CRITICAL;
    if (mag >= 5.5 || potensi?.includes('kerusakan')) return this.SEVERITY_LEVELS.HIGH;
    if (mag >= 4.5) return this.SEVERITY_LEVELS.MODERATE;
    return this.SEVERITY_LEVELS.LOW;
  }

  private determineSeverityMagma(status?: string) {
    if (status === 'AWAS') return this.SEVERITY_LEVELS.CRITICAL;
    if (status === 'SIAGA') return this.SEVERITY_LEVELS.HIGH;
    if (status === 'WASPADA') return this.SEVERITY_LEVELS.MODERATE;
    return this.SEVERITY_LEVELS.LOW;
  }

  private determineHazardType(data: any) {
    if (data.shakemap_id) return 'Gempa Bumi';
    if (data.potensi?.includes('banjir')) return 'Banjir';
    if (data.potensi?.includes('tanah')) return 'Tanah Longsor';
    if (data.potensi?.includes('gunung')) return 'Gunung Api';
    return 'Cuaca Ekstrim';
  }

  async getWarningStats() {
    const result = await this.pool.query(
      `SELECT severity, COUNT(*) as count, COUNT(CASE WHEN status = 'active' THEN 1 END) as active
       FROM early_warnings GROUP BY severity`,
    );
    return result.rows;
  }

  async acknowledgeWarning(id: number, userId?: string) {
    const result = await this.pool.query(
      `UPDATE early_warnings SET status = 'acknowledged', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id],
    );
    return result.rows[0];
  }
}