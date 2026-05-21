import { Injectable } from '@nestjs/common';
import { Prisma, Volunteer, VolunteerDeployment, VolunteerSchedule } from '@prisma/client';
import { VolunteerFilter } from '@nurisk/shared-types/volunteer';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VolunteersRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId?: string;
    fullName?: string;
    phone?: string;
    birthDate?: Date;
    gender?: string;
    bloodType?: string;
    regency?: string;
    district?: string;
    village?: string;
    detailAddress?: string;
    latitude?: number;
    longitude?: number;
    medicalHistory?: string;
    expertise?: string;
    experience?: string;
  }): Promise<Volunteer> {
    return this.prisma.volunteer.create({
      data: {
        userId: data.userId || '',
        fullName: data.fullName,
        phone: data.phone,
        birthDate: data.birthDate,
        gender: data.gender,
        bloodType: data.bloodType,
        regency: data.regency,
        district: data.district,
        village: data.village,
        detailAddress: data.detailAddress,
        medicalHistory: data.medicalHistory,
        expertise: data.expertise,
        experience: data.experience,
        status: 'pending',
      },
    });
  }

  async findById(id: string): Promise<Volunteer | null> {
    return this.prisma.volunteer.findUnique({
      where: { id },
      include: { user: true },
    }) as Promise<Volunteer | null>;
  }

  async findAll(
    filters: VolunteerFilter = {},
    options: PaginationRequest
  ): Promise<ListResponse<Volunteer>> {
    const { status, province, regency, district, search } = filters;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const where: Prisma.VolunteerWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (province) {
      where.OR = [
        { regency: { contains: province, mode: 'insensitive' } },
        { district: { contains: province, mode: 'insensitive' } },
      ];
    }

    if (regency) {
      where.regency = { contains: regency, mode: 'insensitive' };
    }

    if (district) {
      where.district = { contains: district, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.volunteer.count({ where });

    const skip = (page - 1) * limit;
    const validSortFields = ['id', 'fullName', 'status', 'createdAt', 'updatedAt'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const data = await this.prisma.volunteer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [safeSortBy]: sortOrder },
      include: { user: true },
    });

    const totalPages = Math.ceil(total / limit);
    return {
      items: data,
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

  async update(
    id: string,
    data: Partial<{
      fullName: string;
      phone: string;
      birthDate: Date;
      gender: string;
      bloodType: string;
      regency: string;
      district: string;
      village: string;
      detailAddress: string;
      latitude: number;
      longitude: number;
      medicalHistory: string;
      expertise: string;
      experience: string;
      status: string;
    }>
  ): Promise<Volunteer | null> {
    const updateData: Prisma.VolunteerUpdateInput = {};

    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.bloodType !== undefined) updateData.bloodType = data.bloodType;
    if (data.regency !== undefined) updateData.regency = data.regency;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.village !== undefined) updateData.village = data.village;
    if (data.detailAddress !== undefined) updateData.detailAddress = data.detailAddress;
    if (data.medicalHistory !== undefined) updateData.medicalHistory = data.medicalHistory;
    if (data.expertise !== undefined) updateData.expertise = data.expertise;
    if (data.experience !== undefined) updateData.experience = data.experience;
    if (data.status !== undefined) updateData.status = data.status;

    try {
      return await this.prisma.volunteer.update({
        where: { id },
        data: updateData,
      });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.volunteer.delete({ where: { id } }).catch(() => {});
  }

  async findByUserId(userId: string): Promise<Volunteer | null> {
    return this.prisma.volunteer.findUnique({
      where: { userId },
    });
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number = 50,
    expertise?: string
  ): Promise<Volunteer[]> {
    // Note: PostGIS geography queries require raw SQL
    // This is a simplified implementation
    const where: Prisma.VolunteerWhereInput = {
      status: 'approved',
    };

    if (expertise) {
      where.expertise = { contains: expertise, mode: 'insensitive' };
    }

    return this.prisma.volunteer.findMany({
      where,
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByRegion(region: string): Promise<Volunteer[]> {
    return this.prisma.volunteer.findMany({
      where: {
        regency: { contains: region, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  async deploy(data: {
    volunteerId: string;
    incidentId: string;
    availableFrom?: Date;
    availableUntil?: Date;
    note?: string;
  }): Promise<VolunteerDeployment> {
    return this.prisma.volunteerDeployment.create({
      data: {
        volunteerId: data.volunteerId,
        incidentId: data.incidentId,
        availableFrom: data.availableFrom,
        availableUntil: data.availableUntil,
        note: data.note,
        status: 'APPLIED',
      },
    });
  }

  async getDeployments(volunteerId: string): Promise<VolunteerDeployment[]> {
    return this.prisma.volunteerDeployment.findMany({
      where: { volunteerId },
      orderBy: { createdAt: 'desc' },
      include: { incident: true },
    });
  }

  async setAvailability(
    volunteerId: string,
    date: Date,
    shiftStart?: string,
    shiftEnd?: string,
    status: string = 'available'
  ): Promise<VolunteerSchedule> {
    return this.prisma.volunteerSchedule.create({
      data: {
        volunteerId,
        date,
        shiftStart,
        shiftEnd,
        status,
      },
    });
  }

  async getAvailability(
    volunteerId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<VolunteerSchedule[]> {
    const where: Prisma.VolunteerScheduleWhereInput = { volunteerId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return this.prisma.volunteerSchedule.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }
}

// Import PrismaClient
import { PrismaClient } from '@prisma/client';