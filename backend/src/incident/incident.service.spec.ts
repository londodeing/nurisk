import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { IncidentService } from './incident.service';
import { IncidentRepository } from './incident.repository';

// Mock the database pool
const mockQuery = jest.fn();

jest.mock('../config/database', () => ({
  __esModule: true,
  default: { query: mockQuery },
  pool: { query: mockQuery },
}));

describe('IncidentService', () => {
  let service: IncidentService;
  let repository: IncidentRepository;
  let eventEmitter: EventEmitter2;

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllGeoJSON: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    createAuditLog: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentService,
        {
          provide: IncidentRepository,
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<IncidentService>(IncidentService);
    repository = module.get<IncidentRepository>(IncidentRepository);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const validCreateDto = {
      location: { lat: -6.9667, lng: 110.4205, address: 'Semarang' },
      disaster_type: 'BANJIR',
      priority: 'HIGH' as const,
      description: 'Banjir bandang di wilayah Semarang Utara',
      source: 'PUBLIC',
      region: 'SEMARANG',
    };

    it('should create a new incident successfully', async () => {
      const mockIncident = {
        id: 1,
        incident_number: 'INC-20260514-0001',
        location: JSON.stringify(validCreateDto.location),
        disaster_type: 'BANJIR',
        priority: 'HIGH',
        description: 'Banjir bandang di wilayah Semarang Utara',
        source: 'PUBLIC',
        status: 'REPORTED',
        region: 'SEMARANG',
        created_at: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockIncident);

      const result = await service.create(validCreateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Laporan kejadian berhasil dibuat');
      expect(result.data).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledWith({
        location: validCreateDto.location,
        disaster_type: validCreateDto.disaster_type,
        priority: validCreateDto.priority,
        description: validCreateDto.description,
        source: validCreateDto.source,
        reported_by: undefined,
      });
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('incident.created', mockIncident);
    });

    it('should throw BadRequestException for invalid disaster_type', async () => {
      const invalidDto = {
        ...validCreateDto,
        disaster_type: '',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid priority', async () => {
      const invalidDto = {
        ...validCreateDto,
        priority: 'INVALID' as any,
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty description', async () => {
      const invalidDto = {
        ...validCreateDto,
        description: '',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for description exceeding max length', async () => {
      const invalidDto = {
        ...validCreateDto,
        description: 'a'.repeat(2001),
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing location', async () => {
      const invalidDto = {
        disaster_type: 'BANJIR',
        priority: 'HIGH' as const,
        description: 'Test description',
      } as any;

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid location format', async () => {
      const invalidDto = {
        location: 'invalid' as any,
        disaster_type: 'BANJIR',
        priority: 'HIGH' as const,
        description: 'Test description',
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return incident by ID successfully', async () => {
      const mockIncident = {
        id: 1,
        incident_number: 'INC-20260514-0001',
        location: JSON.stringify({ lat: -6.9667, lng: 110.4205 }),
        disaster_type: 'BANJIR',
        priority: 'HIGH',
        description: 'Test incident',
        status: 'REPORTED',
      };

      mockRepository.findById.mockResolvedValue(mockIncident);

      const result = await service.findById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockIncident);
      expect(mockRepository.findById).toHaveBeenCalledWith(1, false);
    });

    it('should throw NotFoundException for non-existent incident', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });

    it('should include deleted incident when includeDeleted is true', async () => {
      const mockIncident = {
        id: 1,
        incident_number: 'INC-20260514-0001',
        deleted_at: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockIncident);

      const result = await service.findById(1, true);

      expect(result.success).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(1, true);
    });
  });

  describe('findAll', () => {
    it('should return paginated incidents', async () => {
      const mockResult = {
        data: [
          { id: 1, incident_number: 'INC-20260514-0001' },
          { id: 2, incident_number: 'INC-20260514-0002' },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      mockRepository.findAll.mockResolvedValue(mockResult);

      const result = await service.findAll();

      expect(result.data).toEqual(mockResult.data);
      expect(result.total).toBe(2);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should pass filters to repository', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockRepository.findAll.mockResolvedValue(mockResult);

      const filters = { status: 'REPORTED', priority: 'HIGH' };
      await service.findAll({}, filters);

      expect(mockRepository.findAll).toHaveBeenCalledWith({}, filters, false);
    });
  });

  describe('findAllGeoJSON', () => {
    it('should return GeoJSON format', async () => {
      const mockGeoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [110.4205, -6.9667] },
            properties: { id: 1, incident_number: 'INC-20260514-0001' },
          },
        ],
      };

      mockRepository.findAllGeoJSON.mockResolvedValue(mockGeoJSON);

      const result = await service.findAllGeoJSON();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGeoJSON);
    });
  });

  describe('update', () => {
    const validUpdateDto = {
      priority: 'CRITICAL' as const,
      description: 'Updated description',
    };

    it('should update incident successfully', async () => {
      const currentIncident = {
        id: 1,
        incident_number: 'INC-20260514-0001',
        status: 'REPORTED',
        priority: 'HIGH',
        description: 'Original description',
      };

      const updatedIncident = {
        ...currentIncident,
        priority: 'CRITICAL',
        description: 'Updated description',
        updated_at: new Date(),
      };

      mockRepository.findById.mockResolvedValue(currentIncident);
      mockRepository.update.mockResolvedValue(updatedIncident);
      mockRepository.createAuditLog.mockResolvedValue({});

      const result = await service.update(1, validUpdateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Kejadian berhasil diperbarui');
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('incident.updated', expect.any(Object));
    });

    it('should throw NotFoundException for non-existent incident', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, validUpdateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const currentIncident = {
        id: 1,
        status: 'COMPLETED',
        priority: 'HIGH',
      };

      const invalidStatusUpdate = {
        status: 'REPORTED' as const, // Cannot go back to REPORTED from COMPLETED
      };

      mockRepository.findById.mockResolvedValue(currentIncident);

      await expect(service.update(1, invalidStatusUpdate)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should allow valid status transition from REPORTED to VERIFIED', async () => {
      const currentIncident = {
        id: 1,
        status: 'REPORTED' as const,
        priority: 'HIGH',
      };

      const validStatusUpdate = {
        status: 'VERIFIED' as const,
      };

      mockRepository.findById.mockResolvedValue(currentIncident);
      mockRepository.update.mockResolvedValue({ ...currentIncident, status: 'VERIFIED' });
      mockRepository.createAuditLog.mockResolvedValue({});

      const result = await service.update(1, validStatusUpdate);

      expect(result.success).toBe(true);
    });

    it('should allow valid status transition from VERIFIED to ASSESSED', async () => {
      const currentIncident = {
        id: 1,
        status: 'VERIFIED' as const,
        priority: 'HIGH',
      };

      const validStatusUpdate = {
        status: 'ASSESSED' as const,
      };

      mockRepository.findById.mockResolvedValue(currentIncident);
      mockRepository.update.mockResolvedValue({ ...currentIncident, status: 'ASSESSED' });
      mockRepository.createAuditLog.mockResolvedValue({});

      const result = await service.update(1, validStatusUpdate);

      expect(result.success).toBe(true);
    });

    it('should allow valid status transition from ASSESSED to COMMANDED', async () => {
      const currentIncident = {
        id: 1,
        status: 'ASSESSED' as const,
        priority: 'HIGH',
      };

      const validStatusUpdate = {
        status: 'COMMANDED' as const,
      };

      mockRepository.findById.mockResolvedValue(currentIncident);
      mockRepository.update.mockResolvedValue({ ...currentIncident, status: 'COMMANDED' });
      mockRepository.createAuditLog.mockResolvedValue({});

      const result = await service.update(1, validStatusUpdate);

      expect(result.success).toBe(true);
    });

    it('should allow valid status transition from COMMANDED to ACTION', async () => {
      const currentIncident = {
        id: 1,
        status: 'COMMANDED' as const,
        priority: 'HIGH',
      };

      const validStatusUpdate = {
        status: 'ACTION' as const,
      };

      mockRepository.findById.mockResolvedValue(currentIncident);
      mockRepository.update.mockResolvedValue({ ...currentIncident, status: 'ACTION' });
      mockRepository.createAuditLog.mockResolvedValue({});

      const result = await service.update(1, validStatusUpdate);

      expect(result.success).toBe(true);
    });

    it('should allow valid status transition from ACTION to COMPLETED', async () => {
      const currentIncident = {
        id: 1,
        status: 'ACTION' as const,
        priority: 'HIGH',
      };

      const validStatusUpdate = {
        status: 'COMPLETED' as const,
      };

      mockRepository.findById.mockResolvedValue(currentIncident);
      mockRepository.update.mockResolvedValue({ ...currentIncident, status: 'COMPLETED' });
      mockRepository.createAuditLog.mockResolvedValue({});

      const result = await service.update(1, validStatusUpdate);

      expect(result.success).toBe(true);
    });

    it('should allow transition to REJECTED from any state', async () => {
      const currentIncident = {
        id: 1,
        status: 'REPORTED' as const,
        priority: 'HIGH',
      };

      const rejectUpdate = {
        status: 'REJECTED' as const,
      };

      mockRepository.findById.mockResolvedValue(currentIncident);
      mockRepository.update.mockResolvedValue({ ...currentIncident, status: 'REJECTED' });
      mockRepository.createAuditLog.mockResolvedValue({});

      const result = await service.update(1, rejectUpdate);

      expect(result.success).toBe(true);
    });

    it('should allow transition to DISMISSED from any state', async () => {
      const currentIncident = {
        id: 1,
        status: 'REPORTED' as const,
        priority: 'HIGH',
      };

      const dismissUpdate = {
        status: 'DISMISSED' as const,
      };

      mockRepository.findById.mockResolvedValue(currentIncident);
      mockRepository.update.mockResolvedValue({ ...currentIncident, status: 'DISMISSED' });
      mockRepository.createAuditLog.mockResolvedValue({});

      const result = await service.update(1, dismissUpdate);

      expect(result.success).toBe(true);
    });
  });

  describe('delete', () => {
    it('should soft delete incident successfully', async () => {
      const mockIncident = {
        id: 1,
        incident_number: 'INC-20260514-0001',
        status: 'REPORTED',
      };

      const deletedIncident = {
        ...mockIncident,
        deleted_at: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockIncident);
      mockRepository.softDelete.mockResolvedValue(deletedIncident);

      const result = await service.delete(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Kejadian berhasil dihapus');
      expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('incident.deleted', { id: 1 });
    });

    it('should throw NotFoundException for non-existent incident', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for already deleted incident', async () => {
      const mockIncident = {
        id: 1,
        deleted_at: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockIncident);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore soft-deleted incident successfully', async () => {
      const mockIncident = {
        id: 1,
        incident_number: 'INC-20260514-0001',
        deleted_at: new Date(),
      };

      const restoredIncident = {
        ...mockIncident,
        deleted_at: null,
      };

      mockRepository.findById.mockResolvedValue(mockIncident);
      mockRepository.restore.mockResolvedValue(restoredIncident);

      const result = await service.restore(1);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Kejadian berhasil dipulihkan');
      expect(mockRepository.restore).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for non-existent incident', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for incident not deleted', async () => {
      const mockIncident = {
        id: 1,
        deleted_at: null,
      };

      mockRepository.findById.mockResolvedValue(mockIncident);

      await expect(service.restore(1)).rejects.toThrow(BadRequestException);
    });
  });
});