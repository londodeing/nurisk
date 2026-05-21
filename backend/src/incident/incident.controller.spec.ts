import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IncidentController } from './incident.controller';
import { IncidentService } from './incident.service';

describe('IncidentController', () => {
  let controller: IncidentController;
  let incidentService: IncidentService;

  const mockIncidentService = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllGeoJSON: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentController],
      providers: [
        {
          provide: IncidentService,
          useValue: mockIncidentService,
        },
      ],
    }).compile();

    controller = module.get<IncidentController>(IncidentController);
    incidentService = module.get<IncidentService>(IncidentService);

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

    it('should create a new incident and return success response', async () => {
      const expectedResult = {
        success: true,
        message: 'Laporan kejadian berhasil dibuat',
        data: {
          id: 1,
          incident_number: 'INC-20260514-0001',
          ...validCreateDto,
        },
      };

      mockIncidentService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(validCreateDto);

      expect(result).toEqual(expectedResult);
      expect(mockIncidentService.create).toHaveBeenCalledWith(validCreateDto);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidDto = {
        location: { lat: -6.9667, lng: 110.4205 },
        disaster_type: '',
        priority: 'HIGH' as const,
        description: '',
      } as any;

      await expect(controller.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing required fields', async () => {
      const invalidDto = {
        location: { lat: -6.9667, lng: 110.4205 },
      } as any;

      await expect(controller.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid priority enum', async () => {
      const invalidDto = {
        ...validCreateDto,
        priority: 'INVALID' as any,
      };

      await expect(controller.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated incidents with success wrapper', async () => {
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

      mockIncidentService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult.data);
      expect(result.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should pass pagination options to service', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      };

      mockIncidentService.findAll.mockResolvedValue(mockResult);

      await controller.findAll('2', '10', 'created_at', 'ASC');

      expect(mockIncidentService.findAll).toHaveBeenCalledWith(
        { page: 2, limit: 10, sortBy: 'created_at', sortOrder: 'ASC' },
        expect.any(Object),
        false
      );
    });

    it('should pass filters to service', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockIncidentService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        'REPORTED',
        'HIGH',
        'BANJIR',
        'SEMARANG',
        '2025-01-01',
        '2025-12-31',
        'search',
        undefined
      );

      expect(mockIncidentService.findAll).toHaveBeenCalledWith(
        expect.any(Object),
        {
          status: 'REPORTED',
          priority: 'HIGH',
          disaster_type: 'BANJIR',
          region: 'SEMARANG',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          search: 'search',
        },
        false
      );
    });

    it('should include deleted when includeDeleted is true', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      mockIncidentService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        'true'
      );

      expect(mockIncidentService.findAll).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        true
      );
    });
  });

  describe('findAllGeoJSON', () => {
    it('should return GeoJSON FeatureCollection', async () => {
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

      mockIncidentService.findAllGeoJSON.mockResolvedValue(mockGeoJSON);

      const result = await controller.findAllGeoJSON();

      expect(result).toEqual(mockGeoJSON);
    });

    it('should pass filters to service', async () => {
      const mockGeoJSON = { type: 'FeatureCollection', features: [] };

      mockIncidentService.findAllGeoJSON.mockResolvedValue(mockGeoJSON);

      await controller.findAllGeoJSON('REPORTED', 'HIGH', 'BANJIR');

      expect(mockIncidentService.findAllGeoJSON).toHaveBeenCalledWith({
        status: 'REPORTED',
        priority: 'HIGH',
        disaster_type: 'BANJIR',
      });
    });
  });

  describe('findById', () => {
    it('should return incident by ID with success wrapper', async () => {
      const mockIncident = {
        id: 1,
        incident_number: 'INC-20260514-0001',
        status: 'REPORTED',
      };

      mockIncidentService.findById.mockResolvedValue({
        success: true,
        data: mockIncident,
      });

      const result = await controller.findById(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockIncident);
      expect(mockIncidentService.findById).toHaveBeenCalledWith(1, false);
    });

    it('should include deleted when includeDeleted is true', async () => {
      mockIncidentService.findById.mockResolvedValue({
        success: true,
        data: { id: 1, deleted_at: new Date() },
      });

      await controller.findById(1, 'true');

      expect(mockIncidentService.findById).toHaveBeenCalledWith(1, true);
    });

    it('should throw NotFoundException for non-existent incident', async () => {
      mockIncidentService.findById.mockRejectedValue(
        new NotFoundException('Kejadian tidak ditemukan')
      );

      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const validUpdateDto = {
      priority: 'CRITICAL' as const,
      description: 'Updated description',
    };

    it('should update incident and return success response', async () => {
      const expectedResult = {
        success: true,
        message: 'Kejadian berhasil diperbarui',
        data: {
          id: 1,
          priority: 'CRITICAL',
          description: 'Updated description',
        },
      };

      mockIncidentService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, validUpdateDto);

      expect(result).toEqual(expectedResult);
      expect(mockIncidentService.update).toHaveBeenCalledWith(1, validUpdateDto, false);
    });

    it('should throw BadRequestException for invalid DTO', async () => {
      const invalidDto = {
        priority: 'INVALID' as any,
      };

      await expect(controller.update(1, invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should include deleted when includeDeleted is true', async () => {
      mockIncidentService.update.mockResolvedValue({
        success: true,
        data: { id: 1 },
      });

      await controller.update(1, validUpdateDto, 'true');

      expect(mockIncidentService.update).toHaveBeenCalledWith(1, validUpdateDto, true);
    });

    it('should throw NotFoundException for non-existent incident', async () => {
      mockIncidentService.update.mockRejectedValue(
        new NotFoundException('Kejadian tidak ditemukan')
      );

      await expect(controller.update(999, validUpdateDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      mockIncidentService.update.mockRejectedValue(
        new BadRequestException('Tidak dapat mengubah status dari COMPLETED ke REPORTED')
      );

      await expect(controller.update(1, { status: 'REPORTED' as any })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('delete', () => {
    it('should soft delete incident and return success response', async () => {
      const expectedResult = {
        success: true,
        message: 'Kejadian berhasil dihapus',
        data: { id: 1, deleted_at: new Date() },
      };

      mockIncidentService.delete.mockResolvedValue(expectedResult);

      const result = await controller.delete(1);

      expect(result).toEqual(expectedResult);
      expect(mockIncidentService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for non-existent incident', async () => {
      mockIncidentService.delete.mockRejectedValue(
        new NotFoundException('Kejadian tidak ditemukan')
      );

      await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('should restore soft-deleted incident and return success response', async () => {
      const expectedResult = {
        success: true,
        message: 'Kejadian berhasil dipulihkan',
        data: { id: 1, deleted_at: null },
      };

      mockIncidentService.restore.mockResolvedValue(expectedResult);

      const result = await controller.restore(1);

      expect(result).toEqual(expectedResult);
      expect(mockIncidentService.restore).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException for non-existent incident', async () => {
      mockIncidentService.restore.mockRejectedValue(
        new NotFoundException('Kejadian tidak ditemukan')
      );

      await expect(controller.restore(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for incident not deleted', async () => {
      mockIncidentService.restore.mockRejectedValue(
        new BadRequestException('Kejadian tidak dalam status terhapus')
      );

      await expect(controller.restore(1)).rejects.toThrow(BadRequestException);
    });
  });
});