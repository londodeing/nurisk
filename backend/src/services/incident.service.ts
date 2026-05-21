import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class IncidentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Migrated Severity Scoring Engine (Ref Section 5.6 PRD)
   * Mengonversi data dampak menjadi skor prioritas terpadu.
   */
  private calculateAIScore(data: any): { score: number; level: string } {
    const d = data.dampak_manusia || {};
    const h = data.dampak_rumah || {};
    const f = data.dampak_fasum || {};
    const v = data.dampak_vital || {};
    const l = data.dampak_lingkungan || {};

    // Bobot perhitungan sesuai incidentController.js
    const score =
      (Number(d.meninggal) || 0) * 100 +
      (Number(d.hilang) || 0) * 80 +
      (Number(d.sakit) || 0) * 40 +
      (Number(d.mengungsi) || 0) * 30 +
      (Number(d.terdampak) || 0) * 10 +
      (Number(h.berat) || 0) * 50 +
      (Number(h.sedang) || 0) * 30 +
      (Number(h.ringan) || 0) * 10 +
      (Number(f.faskes) || 0) * 60 +
      (Number(f.ibadah) || 0) * 20 +
      (Number(f.sekolah) || 0) * 25 +
      (Number(v.air_bersih) || 0) * 70 +
      (Number(v.listrik) || 0) * 50 +
      (Number(v.telkom) || 0) * 30 +
      (Number(v.irigasi) || 0) * 20 +
      (Number(v.jalan) || 0) * 60 +
      (Number(v.spbu) || 0) * 25 +
      (Number(l.sawah) || 0) * 5 +
      (Number(l.ternak) || 0) * 2;

    let level = 'LOW';
    if (score > 1000) level = 'CRITICAL';
    else if (score > 500) level = 'HIGH';
    else if (score > 200) level = 'MEDIUM';

    return { score, level };
  }

  /**
   * Memproses update assessment menggunakan Prisma
   */
  async updateAssessment(id: number, data: any) {
    const aiResults = this.calculateAIScore(data);
    
    // Gunakan input manual jika tersedia, jika tidak gunakan hasil AI
    const finalScore = data.priority_score ?? aiResults.score;
    const finalLevel = data.priority_level ?? aiResults.level;

    try {
      const updateData = {
        kecamatan: data.kecamatan,
        desa: data.desa,
        alamatSpesifik: data.alamat_spesifik,
        kondisiMutakhir: data.kondisi_mutakhir ?? data.description,
        dampakManusia: data.dampak_manusia,
        dampakRumah: data.dampak_rumah,
        dampakFasum: data.dampak_fasum,
        dampakVital: data.dampak_vital,
        dampakLingkungan: data.dampak_lingkungan,
        needsNumeric: data.needs_numeric,
        priorityScore: finalScore,
        priorityLevel: finalLevel,
        status: 'VERIFIED',
        eventDate: data.event_date ? new Date(data.event_date) : undefined,
        updatedAt: new Date(),
      };
      return await this.prisma.incident.update({
        where: { id },
        data: updateData,
      } as any);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new NotFoundException(`Insiden #${id} tidak ditemukan`);
      }
      throw error;
    }
  }
}
