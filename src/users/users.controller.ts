/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un nouvel utilisateur',
    description:
      'Crée un nouveau compte utilisateur avec email, password, firstName et lastName',
  })
  @ApiBody({
    type: CreateUserDto,
    description: "Données de création de l'utilisateur",
    examples: {
      example1: {
        value: {
          email: 'user@example.com',
          password: 'SecurePassword123!',
          firstName: 'Jean',
          lastName: 'Dupont',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur créé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides ou email déjà existant',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur lors de la création',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Récupérer tous les utilisateurs',
    description:
      'Retourne la liste de tous les utilisateurs, trié par date de création décroissante',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs',
    type: [UserResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur lors de la récupération des utilisateurs',
  })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Récupérer un utilisateur par ID',
    description: "Retourne les détails d'un utilisateur spécifique",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: "Identifiant unique de l'utilisateur",
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur trouvé',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 400,
    description: 'ID invalide',
  })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.findById(id);
  }

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Récupérer un utilisateur par email',
    description:
      "Retourne les détails d'un utilisateur en recherchant par email",
  })
  @ApiParam({
    name: 'email',
    type: 'string',
    format: 'email',
    description: "Adresse email de l'utilisateur",
    example: 'user@example.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur trouvé',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur avec cet email non trouvé',
  })
  @ApiResponse({
    status: 400,
    description: 'Email invalide',
  })
  async findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    if (!email || email.trim() === '') {
      throw new BadRequestException('Email is required');
    }
    return await this.usersService.findByEmail(email);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour un utilisateur',
    description:
      "Met à jour les informations d'un utilisateur (email, password, firstName, lastName)",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: "Identifiant unique de l'utilisateur à mettre à jour",
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Champs à mettre à jour (tous les champs sont optionnels)',
    examples: {
      example1: {
        value: {
          firstName: 'Jean-Michel',
          lastName: 'Dupont',
        },
      },
      example2: {
        value: {
          email: 'newemail@example.com',
          password: 'NewPassword456!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 409,
    description: 'Email déjà utilisé par un autre utilisateur',
  })
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
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
    description: 'Supprime complètement un utilisateur du système',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: "Identifiant unique de l'utilisateur à supprimer",
  })
  @ApiResponse({
    status: 204,
    description: 'Utilisateur supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 400,
    description: 'ID invalide',
  })
  async delete(@Param('id') id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.delete(id);
  }

  @Put(':id/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Désactiver un utilisateur',
    description:
      "Change le statut de l'utilisateur à DISABLED (bloque l'accès sans supprimer les données)",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: "Identifiant unique de l'utilisateur à désactiver",
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur désactivé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async disable(@Param('id') id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.disable(id);
  }

  @Put(':id/enable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activer un utilisateur',
    description:
      "Change le statut de l'utilisateur à ACTIVE (restaure l'accès)",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: "Identifiant unique de l'utilisateur à activer",
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur activé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async enable(@Param('id') id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.enable(id);
  }

  @Put(':id/verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Vérifier l'email d'un utilisateur",
    description: "Marque l'adresse email de l'utilisateur comme vérifiée",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: "Identifiant unique de l'utilisateur",
  })
  @ApiResponse({
    status: 200,
    description: 'Email vérifié avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  async verifyEmail(@Param('id') id: string): Promise<UserResponseDto> {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
    return await this.usersService.verifyEmail(id);
  }
}
