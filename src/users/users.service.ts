/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Logger,
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

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, firstName, lastName } = createUserDto;

    try {
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        this.logger.warn(
          `Attempt to create user with existing email: ${email}`,
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

      this.logger.log(`User created successfully: ${savedUser.id}`);

      return this.mapUserToResponseDto(savedUser);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error(
        `Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    try {
      const users = await this.usersRepository.find({
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`Retrieved ${users.length} users`);

      return users.map((user) => this.mapUserToResponseDto(user));
    } catch (error) {
      this.logger.error(
        `Error retrieving users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findById(id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }

    try {
      const user = await this.usersRepository.findOne({
        where: { id },
      });

      if (!user) {
        this.logger.warn(`User not found: ${id}`);
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      this.logger.log(`User retrieved: ${id}`);

      return this.mapUserToResponseDto(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error retrieving user ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    if (!email || email.trim() === '') {
      throw new BadRequestException('Email is required');
    }

    try {
      const user = await this.usersRepository.findOne({
        where: { email },
      });

      if (!user) {
        this.logger.warn(`User not found with email: ${email}`);
        throw new NotFoundException(`User with email ${email} not found`);
      }

      this.logger.log(`User retrieved by email: ${email}`);

      return this.mapUserToResponseDto(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error retrieving user by email ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      this.logger.warn(`Attempt to update non-existent user: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        this.logger.warn(
          `Attempt to update user ${id} with existing email: ${updateUserDto.email}`,
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

      this.logger.log(`User updated successfully: ${id}`);

      return this.mapUserToResponseDto(updatedUser);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      this.logger.error(
        `Error updating user ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async disable(id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      this.logger.warn(`Attempt to disable non-existent user: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      existingUser.status = UserStatus.DISABLED;
      const disabledUser = await this.usersRepository.save(existingUser);

      this.logger.log(`User disabled: ${id}`);

      return this.mapUserToResponseDto(disabledUser);
    } catch (error) {
      this.logger.error(
        `Error disabling user ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed to disable user');
    }
  }

  async enable(id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    const existingUser = await this.usersRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      this.logger.warn(`Attempt to enable non-existent user: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    try {
      existingUser.status = UserStatus.ACTIVE;
      const enabledUser = await this.usersRepository.save(existingUser);

      this.logger.log(`User enabled: ${id}`);

      return this.mapUserToResponseDto(enabledUser);
    } catch (error) {
      this.logger.error(
        `Error enabling user ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
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
