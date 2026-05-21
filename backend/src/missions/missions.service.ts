import { Injectable } from '@nestjs/common';

import { Mission, MissionsRepository } from './missions.repository';
import { MissionFilter } from '@nurisk/shared-types/mission';

import type { MissionAssignment, MissionReport } from '@nurisk/shared-types';

@Injectable()
export class MissionsService {
  constructor(private missionsRepository: MissionsRepository) {}

  async create(data: Partial<Mission>): Promise<Mission> {
    return this.missionsRepository.create(data);
  }

  async findAll(filters: MissionFilter): Promise<Mission[]> {
    return this.missionsRepository.findAll(filters);
  }

  async findById(id: number): Promise<Mission | null> {
    return this.missionsRepository.findById(id);
  }

  async update(id: number, data: Partial<Mission>): Promise<Mission | null> {
    return this.missionsRepository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.missionsRepository.delete(id);
  }

  async deployVolunteer(missionId: number, volunteerId: number): Promise<any> {
    return this.missionsRepository.deployVolunteer(missionId, volunteerId);
  }

  async recallVolunteer(missionId: number, volunteerId: number): Promise<any> {
    return this.missionsRepository.recallVolunteer(missionId, volunteerId);
  }

  async getDeployments(missionId: number): Promise<any[]> {
    return this.missionsRepository.getDeployments(missionId);
  }
}