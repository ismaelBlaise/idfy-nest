/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { OAuthClientController } from './oauth-client.controller';
import { OAuthClientService } from './oauth-client.service';
import { ClientStatusEnum } from './entities/oauth-client.entity';

describe('OAuthClientController', () => {
  let controller: OAuthClientController;
  let service: OAuthClientService;

  const mockOAuthClientService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthClientController],
      providers: [
        {
          provide: OAuthClientService,
          useValue: mockOAuthClientService,
        },
      ],
    }).compile();

    controller = module.get<OAuthClientController>(OAuthClientController);
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

      const mockResult = {
        id: 'client-1',
        name: 'Test App',
        clientId: 'client_abc123',
        clientSecret: 'secret_xyz',
        redirectUri: 'http://localhost:3000/callback',
        status: ClientStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOAuthClientService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createDto);

      expect(result.clientId).toBe('client_abc123');
      expect(result.clientSecret).toBe('secret_xyz');
      expect(service.create).toHaveBeenCalledWith(createDto);
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

      mockOAuthClientService.findAll.mockResolvedValue(mockClients);

      const result = await controller.findAll();

      expect(result).toBeDefined();
      expect(service.findAll).toHaveBeenCalled();
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

      mockOAuthClientService.findOne.mockResolvedValue(mockClient);

      const result = await controller.findOne('client-1');

      expect(result).toBeDefined();
      expect(service.findOne).toHaveBeenCalledWith('client-1');
    });
  });

  describe('update', () => {
    it('should update an OAuth client', async () => {
      const updateDto = { name: 'Updated App' };
      const mockClient = {
        id: 'client-1',
        name: 'Updated App',
        clientId: 'client_abc',
        clientSecret: 'secret',
        redirectUri: 'http://localhost:3000/callback',
        status: ClientStatusEnum.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOAuthClientService.update.mockResolvedValue(mockClient);

      const result = await controller.update('client-1', updateDto);

      expect(result).toBeDefined();
      expect(service.update).toHaveBeenCalledWith('client-1', updateDto);
    });
  });

  describe('updateStatus', () => {
    it('should update client status', async () => {
      const updateStatusDto = { status: ClientStatusEnum.DISABLED };
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

      mockOAuthClientService.updateStatus.mockResolvedValue(mockClient);

      const result = await controller.updateStatus('client-1', updateStatusDto);

      expect(result).toBeDefined();
      expect(service.updateStatus).toHaveBeenCalledWith(
        'client-1',
        updateStatusDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove an OAuth client', async () => {
      mockOAuthClientService.remove.mockResolvedValue(undefined);

      await controller.remove('client-1');

      expect(service.remove).toHaveBeenCalledWith('client-1');
    });
  });
});
