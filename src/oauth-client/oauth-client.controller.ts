import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OAuthClientService } from './oauth-client.service';
import {
  CreateOAuthClientDto,
  UpdateOAuthClientDto,
  UpdateClientStatusDto,
  OAuthClientResponseDto,
  OAuthClientSecretDto,
} from './dto';
import { plainToClass } from 'class-transformer';

@ApiTags('OAuth Clients')
@Controller('oauth-clients')
export class OAuthClientController {
  constructor(private readonly oauthClientService: OAuthClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un nouveau client OAuth',
    description:
      'Enregistre une nouvelle application cliente. Le clientSecret ne sera retourné que cette seule fois.',
  })
  @ApiBody({
    type: CreateOAuthClientDto,
    description: 'Données de création du client OAuth',
    examples: {
      example1: {
        value: {
          name: 'My Web Application',
          redirectUri: 'http://localhost:3000/callback',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Client OAuth créé avec succès (clientSecret visible une fois)',
    type: OAuthClientSecretDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  async create(
    @Body() createOAuthClientDto: CreateOAuthClientDto,
  ): Promise<OAuthClientSecretDto> {
    const client = await this.oauthClientService.create(createOAuthClientDto);

    return {
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      status: client.status,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Récupérer tous les clients OAuth',
    description:
      'Retourne la liste de tous les clients OAuth enregistrés (clientSecret masqué)',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des clients OAuth',
    type: [OAuthClientResponseDto],
  })
  async findAll(): Promise<OAuthClientResponseDto[]> {
    const clients = await this.oauthClientService.findAll();
    return plainToClass(OAuthClientResponseDto, clients, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Récupérer un client OAuth par ID',
    description:
      "Retourne les détails d'un client OAuth spécifique (clientSecret masqué)",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identifiant unique du client OAuth',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Client OAuth trouvé',
    type: OAuthClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Client OAuth non trouvé',
  })
  async findOne(@Param('id') id: string): Promise<OAuthClientResponseDto> {
    const client = await this.oauthClientService.findOne(id);
    return plainToClass(OAuthClientResponseDto, client, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour un client OAuth',
    description:
      "Met à jour les informations d'un client (nom, redirectUri). Le clientSecret reste inchangé.",
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identifiant unique du client OAuth',
  })
  @ApiBody({
    type: UpdateOAuthClientDto,
    description: 'Champs à mettre à jour (tous optionnels)',
    examples: {
      example1: {
        value: {
          name: 'Updated Application Name',
          redirectUri: 'http://localhost:3001/callback',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Client OAuth mis à jour avec succès',
    type: OAuthClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Client OAuth non trouvé',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOAuthClientDto: UpdateOAuthClientDto,
  ): Promise<OAuthClientResponseDto> {
    const client = await this.oauthClientService.update(
      id,
      updateOAuthClientDto,
    );
    return plainToClass(OAuthClientResponseDto, client, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Mettre à jour le statut d'un client OAuth",
    description:
      'Change le statut du client (ACTIVE ou DISABLED). Les clients DISABLED ne peuvent pas être utilisés.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identifiant unique du client OAuth',
  })
  @ApiBody({
    type: UpdateClientStatusDto,
    description: 'Nouveau statut du client',
    examples: {
      example1: {
        value: { status: 'DISABLED' },
      },
      example2: {
        value: { status: 'ACTIVE' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Statut du client mis à jour avec succès',
    type: OAuthClientResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Client OAuth non trouvé',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateClientStatusDto,
  ): Promise<OAuthClientResponseDto> {
    const client = await this.oauthClientService.updateStatus(
      id,
      updateStatusDto,
    );
    return plainToClass(OAuthClientResponseDto, client, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un client OAuth',
    description: 'Supprime définitivement un client OAuth du système',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Identifiant unique du client OAuth à supprimer',
  })
  @ApiResponse({
    status: 204,
    description: 'Client OAuth supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Client OAuth non trouvé',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.oauthClientService.remove(id);
  }
}
