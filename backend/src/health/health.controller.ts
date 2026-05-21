import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import * as os from 'os';
import { PrismaService } from '../prisma/prisma.service';

interface HealthCheckResult {
  name: string;
  status: 'ok' | 'degraded' | 'down';
  latencyMs: number;
  error?: string;
}

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMemory(),
      this.checkDisk(),
    ]);

    const results: HealthCheckResult[] = checks.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      const names = ['database', 'memory', 'disk'];
      return {
        name: names[i],
        status: 'down',
        latencyMs: -1,
        error: r.reason?.message || String(r.reason),
      };
    });

    const criticalDown = results.filter(
      (r) => r.name === 'database' && r.status === 'down',
    );
    const overallStatus = criticalDown.length > 0 ? 'degraded' : 'ok';

    return {
      success: true,
      data: {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: results,
      },
    };
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { name: 'database', status: 'ok', latencyMs: Date.now() - start };
    } catch (err) {
      return {
        name: 'database',
        status: 'down',
        latencyMs: Date.now() - start,
        error: (err as Error).message,
      };
    }
  }

  private async checkMemory(): Promise<HealthCheckResult> {
    const start = Date.now();
    const free = os.freemem();
    const total = os.totalmem();
    const freeMb = Math.round(free / 1024 / 1024);
    const thresholdMb = 50;
    const status = freeMb > thresholdMb ? 'ok' : 'degraded';
    return {
      name: 'memory',
      status,
      latencyMs: Date.now() - start,
    };
  }

  private async checkDisk(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      const { stdout } = await execAsync('df -k / | tail -1 | awk \'{print $4}\'');
      const availableKb = parseInt(stdout.trim(), 10);
      const availableMb = Math.round(availableKb / 1024);
      const status = availableMb > 100 ? 'ok' : 'degraded';
      return {
        name: 'disk',
        status,
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        name: 'disk',
        status: 'degraded',
        latencyMs: Date.now() - start,
        error: 'disk check not available on this platform',
      };
    }
  }
}
