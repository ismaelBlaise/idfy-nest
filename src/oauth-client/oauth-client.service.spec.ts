/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OAuthClientService } from './oauth-client.service';
import { OAuthClient, ClientStatusEnum } from './entities/oauth-client.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('OAuthClientService', () => {
  let service: OAuthClientService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthClientService,
        {
          provide: getRepositoryToken(OAuthClient),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OAuthClientService>(OAuthClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new OAuth client', async () => {
      const createDto = {
        name: 'Test App',
        redirectUri: 'http://localhost:3000/callback',
      };

      const mockClient = {
        id: 'client-1',
        name: 'Test App',
        clientId: 'client_abc123',
        clientSecret: 'secret_xyz',
        redirectUri: 'http://localhost:3000/callback',
        status: ClientStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.mocked(bcrypt.hash).mockResolvedValue('hashedSecret' as never);
      mockRepository.create.mockReturnValue(mockClient);
      mockRepository.save.mockResolvedValue(mockClient);

      const result = await service.create(createDto);

      expect(result).toEqual(mockClient);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all OAuth clients', async () => {
      const mockClients = [
        {
          id: 'client-1',
          name: 'App 1',
          clientId: 'client_1',
          clientSecret: 'secret_1',
          redirectUri: 'http://localhost:3000/callback',
          status: ClientStatusEnum.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockClients);

      const result = await service.findAll();

      expect(result).toEqual(mockClients);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an OAuth client by id', async () => {
      const mockClient = {
        id: 'client-1',
        name: 'Test App',
        clientId: 'client_abc',
        clientSecret: 'secret',
        redirectUri: 'http://localhost:3000/callback',
        status: ClientStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockClient);

      const result = await service.findOne('client-1');

      expect(result).toEqual(mockClient);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'client-1' },
      });
    });

    it('should throw NotFoundException if client does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an OAuth client', async () => {
      const mockClient = {
        id: 'client-1',
        name: 'Test App',
        clientId: 'client_abc',
        clientSecret: 'secret',
        redirectUri: 'http://localhost:3000/callback',
        status: ClientStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto = { name: 'Updated App' };

      mockRepository.findOne.mockResolvedValue(mockClient);
      mockRepository.save.mockResolvedValue({
        ...mockClient,
        name: 'Updated App',
      });

      const result = await service.update('client-1', updateDto);

      expect(result.name).toBe('Updated App');
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update client status', async () => {
      const mockClient = {
        id: 'client-1',
        name: 'Test App',
        clientId: 'client_abc',
        clientSecret: 'secret',
        redirectUri: 'http://localhost:3000/callback',
        status: ClientStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockClient);
      mockRepository.save.mockResolvedValue({
        ...mockClient,
        status: ClientStatusEnum.DISABLED,
      });

      const result = await service.updateStatus('client-1', {
        status: ClientStatusEnum.DISABLED,
      });

      expect(result.status).toBe(ClientStatusEnum.DISABLED);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an OAuth client', async () => {
      const mockClient = {
        id: 'client-1',
        name: 'Test App',
        clientId: 'client_abc',
        clientSecret: 'secret',
        redirectUri: 'http://localhost:3000/callback',
        status: ClientStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockClient);
      mockRepository.remove.mockResolvedValue(mockClient);

      await service.remove('client-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockClient);
    });
  });

  describe('verifyClientSecret', () => {
    it('should verify client secret successfully', async () => {
      const mockClient = {
        id: 'client-1',
        name: 'Test App',
        clientId: 'client_abc',
        clientSecret: 'hashedSecret',
        redirectUri: 'http://localhost:3000/callback',
        status: ClientStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockClient);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.verifyClientSecret(
        'client_abc',
        'plainSecret',
      );

      expect(result).toBe(true);
    });
  });

  describe('isClientActive', () => {
    it('should return true if client is active', async () => {
      const mockClient = {
        id: 'client-1',
        name: 'Test App',
        clientId: 'client_abc',
        clientSecret: 'secret',
        redirectUri: 'http://localhost:3000/callback',
        status: ClientStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockClient);

      const result = await service.isClientActive('client-1');

      expect(result).toBe(true);
    });

    it('should return false if client is disabled', async () => {
      const mockClient = {
        id: 'client-1',
        name: 'Test App',
        clientId: 'client_abc',
        clientSecret: 'secret',
        redirectUri: 'http://localhost:3000/callback',
        status: ClientStatusEnum.DISABLED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockClient);

      const result = await service.isClientActive('client-1');

      expect(result).toBe(false);
    });
  });
});
