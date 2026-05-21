import { Volunteer, VolunteerDeployment, VolunteerSchedule } from '@prisma/client';
import { VolunteerFilter } from '@nurisk/shared-types/volunteer';
import { PaginationRequest, ListResponse } from '@nurisk/shared-types/api';
import { PrismaService } from '../prisma/prisma.service';
export declare class VolunteersRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
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
    }): Promise<Volunteer>;
    findById(id: string): Promise<Volunteer | null>;
    findAll(filters: VolunteerFilter | undefined, options: PaginationRequest): Promise<ListResponse<Volunteer>>;
    update(id: string, data: Partial<{
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
    }>): Promise<Volunteer | null>;
    delete(id: string): Promise<void>;
    findByUserId(userId: string): Promise<Volunteer | null>;
    findNearby(lat: number, lng: number, radiusKm?: number, expertise?: string): Promise<Volunteer[]>;
    findByRegion(region: string): Promise<Volunteer[]>;
    deploy(data: {
        volunteerId: string;
        incidentId: string;
        availableFrom?: Date;
        availableUntil?: Date;
        note?: string;
    }): Promise<VolunteerDeployment>;
    getDeployments(volunteerId: string): Promise<VolunteerDeployment[]>;
    setAvailability(volunteerId: string, date: Date, shiftStart?: string, shiftEnd?: string, status?: string): Promise<VolunteerSchedule>;
    getAvailability(volunteerId: string, startDate?: Date, endDate?: Date): Promise<VolunteerSchedule[]>;
}
//# sourceMappingURL=volunteers.repository.d.ts.map