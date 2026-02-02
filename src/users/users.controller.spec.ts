import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    disable: jest.fn(),
    enable: jest.fn(),
    verifyEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call usersService.create with correct parameters', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockUsersService.create.mockResolvedValue({
        id: '123',
        ...createUserDto,
        status: 'ACTIVE',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should call usersService.findAll', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should call usersService.findById with correct id', async () => {
      const id = '123';
      mockUsersService.findById.mockResolvedValue({
        id,
        email: 'test@example.com',
      });

      await controller.findById(id);

      expect(mockUsersService.findById).toHaveBeenCalledWith(id);
    });
  });
});
