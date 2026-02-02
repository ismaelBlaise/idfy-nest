import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<UserResponseDto[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.findById(id);
  }

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  async findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    if (!email || email.trim() === '') {
      throw new BadRequestException('Email is required');
    }
    return await this.usersService.findByEmail(email);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.delete(id);
  }

  @Put(':id/disable')
  @HttpCode(HttpStatus.OK)
  async disable(@Param('id') id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.disable(id);
  }

  @Put(':id/enable')
  @HttpCode(HttpStatus.OK)
  async enable(@Param('id') id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.enable(id);
  }

  @Put(':id/verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Param('id') id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.verifyEmail(id);
  }
}
