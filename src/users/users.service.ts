/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { plainToInstance } from 'class-transformer';
import { AppLogger } from '../common/logger';

@Injectable()
export class UsersService {
  private readonly logger = new AppLogger(UsersService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const startTime = Date.now();
    const { email, password, firstName, lastName } = createUserDto;

    this.logger.info('👤 Creating new user', { email, firstName, lastName });

    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        this.logger.logWarningDetails(
          'Attempt to create user with existing email',
          'MEDIUM',
          { email },
        );
        throw new ConflictException(`User with email ${email} already exists`);
      }

      const hashedPassword = await this.hashPassword(password);

      const user = this.usersRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        status: UserStatus.ACTIVE,
        emailVerified: false,
      });

      const savedUser = await this.usersRepository.save(user);
      const duration = Date.now() - startTime;

      this.logger.logDataOperation('CREATE', 'User', savedUser.id, duration, {
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        status: savedUser.status,
      });

      return this.mapUserToResponseDto(savedUser);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      const duration = Date.now() - startTime;
      this.logger.logErrorDetails(
        'Failed to create user',
        'USER_CREATION_ERROR',
        500,
        {
          email,
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown',
        },
      );
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const startTime = Date.now();
    this.logger.info('📋 Retrieving all users');

    try {
      const users = await this.usersRepository.find({
        order: { createdAt: 'DESC' },
      });

      const duration = Date.now() - startTime;
      this.logger.logDatabase('SELECT', 'users', duration, {
        total: users.length,
      });

      return users.map((user) => this.mapUserToResponseDto(user));
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logErrorDetails(
        'Failed to retrieve users',
        'USER_RETRIEVAL_ERROR',
        500,
        {
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown',
        },
      );
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findById(id: string): Promise<UserResponseDto> {
    const startTime = Date.now();

    if (!id || id.trim() === '') {
      this.logger.logWarningDetails('Invalid user ID', 'LOW', { id });
      throw new BadRequestException('User ID is required');
    }

    this.logger.info('🔍 Finding user by ID', { id });

    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      });

      if (!user) {
        const duration = Date.now() - startTime;
        this.logger.logWarningDetails('User not found', 'MEDIUM', {
          id,
          duration: `${duration}ms`,
        });
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const duration = Date.now() - startTime;
      this.logger.logDatabase('SELECT', 'users', duration, {
        found: true,
        email: user.email,
      });

      return this.mapUserToResponseDto(user);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const duration = Date.now() - startTime;
      this.logger.logErrorDetails(
        'Failed to find user',
        'USER_FIND_ERROR',
        500,
        {
          id,
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown',
        },
      );
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const startTime = Date.now();

    if (!email || email.trim() === '') {
      this.logger.logWarningDetails('Invalid email', 'LOW', { email });
      throw new BadRequestException('Email is required');
    }

    this.logger.info('🔍 Finding user by email', { email });

    try {
      const user = await this.usersRepository.findOne({
        where: { email },
      });

      if (!user) {
        const duration = Date.now() - startTime;
        this.logger.logWarningDetails('User not found by email', 'MEDIUM', {
          email,
          duration: `${duration}ms`,
        });
        throw new NotFoundException(`User with email ${email} not found`);
      }

      const duration = Date.now() - startTime;
      this.logger.logDatabase('SELECT', 'users', duration, {
        found: true,
        email: user.email,
      });

      return this.mapUserToResponseDto(user);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      const duration = Date.now() - startTime;
      this.logger.logErrorDetails(
        'Failed to find user by email',
        'USER_FIND_BY_EMAIL_ERROR',
        500,
        {
          email,
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown',
        },
      );
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const startTime = Date.now();

    if (!id || id.trim() === '') {
      this.logger.logWarningDetails('Invalid user ID', 'LOW', { id });
      throw new BadRequestException('User ID is required');
    }

    this.logger.info('✏️ Updating user', {
      id,
      updates: Object.keys(updateUserDto),
    });

    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      this.logger.logWarningDetails(
        'Attempt to update non-existent user',
        'MEDIUM',
        { id },
      );
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        this.logger.logWarningDetails(
          'Attempt to update user with existing email',
          'MEDIUM',
          { id, newEmail: updateUserDto.email },
        );
        throw new ConflictException(
          `Email ${updateUserDto.email} is already in use`,
        );
      }
    }

    try {
      if (updateUserDto.password) {
        updateUserDto.password = await this.hashPassword(
          updateUserDto.password,
        );
      }

      Object.assign(existingUser, updateUserDto);
      const updatedUser = await this.usersRepository.save(existingUser);
      const duration = Date.now() - startTime;

      this.logger.logDataOperation('UPDATE', 'User', id, duration, {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      });

      return this.mapUserToResponseDto(updatedUser);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      const duration = Date.now() - startTime;
      this.logger.logErrorDetails(
        'Failed to update user',
        'USER_UPDATE_ERROR',
        500,
        {
          id,
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown',
        },
      );
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async disable(id: string): Promise<UserResponseDto> {
    const startTime = Date.now();

    if (!id || id.trim() === '') {
      this.logger.logWarningDetails('Invalid user ID', 'LOW', { id });
      throw new BadRequestException('User ID is required');
    }

    this.logger.info('🔒 Disabling user', { id });

    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      this.logger.logWarningDetails(
        'Attempt to disable non-existent user',
        'MEDIUM',
        { id },
      );
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      existingUser.status = UserStatus.DISABLED;
      const disabledUser = await this.usersRepository.save(existingUser);
      const duration = Date.now() - startTime;

      this.logger.logDataOperation('UPDATE', 'User Status', id, duration, {
        status: UserStatus.DISABLED,
        email: disabledUser.email,
      });

      return this.mapUserToResponseDto(disabledUser);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logErrorDetails(
        'Failed to disable user',
        'USER_DISABLE_ERROR',
        500,
        {
          id,
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown',
        },
      );
      throw new InternalServerErrorException('Failed to disable user');
    }
  }

  async enable(id: string): Promise<UserResponseDto> {
    const startTime = Date.now();

    if (!id || id.trim() === '') {
      this.logger.logWarningDetails('Invalid user ID', 'LOW', { id });
      throw new BadRequestException('User ID is required');
    }

    this.logger.info('🔓 Enabling user', { id });

    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      this.logger.logWarningDetails(
        'Attempt to enable non-existent user',
        'MEDIUM',
        { id },
      );
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      existingUser.status = UserStatus.ACTIVE;
      const enabledUser = await this.usersRepository.save(existingUser);
      const duration = Date.now() - startTime;

      this.logger.logDataOperation('UPDATE', 'User Status', id, duration, {
        status: UserStatus.ACTIVE,
        email: enabledUser.email,
      });

      return this.mapUserToResponseDto(enabledUser);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logErrorDetails(
        'Failed to enable user',
        'USER_ENABLE_ERROR',
        500,
        {
          id,
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown',
        },
      );
      throw new InternalServerErrorException('Failed to enable user');
    }
  }

  async delete(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      this.logger.warn(`Attempt to delete non-existent user: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      await this.usersRepository.remove(existingUser);

      this.logger.log(`User deleted permanently: ${id}`);
    } catch (error) {
      this.logger.error(
        `Error deleting user ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async verifyEmail(id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      this.logger.warn(`Attempt to verify email for non-existent user: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      existingUser.emailVerified = true;
      const updatedUser = await this.usersRepository.save(existingUser);

      this.logger.log(`Email verified for user: ${id}`);

      return this.mapUserToResponseDto(updatedUser);
    } catch (error) {
      this.logger.error(
        `Error verifying email for user ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to verify email');
    }
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      this.logger.error(
        `Error verifying password: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to verify password');
    }
  }

  async findByEmailWithPassword(email: string) {
    if (!email || email.trim() === '') {
      throw new BadRequestException('Email is required');
    }

    try {
      const user = await this.usersRepository.findOne({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error retrieving user with password: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      this.logger.error(
        `Error hashing password: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to hash password');
    }
  }

  private mapUserToResponseDto(user: any): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
