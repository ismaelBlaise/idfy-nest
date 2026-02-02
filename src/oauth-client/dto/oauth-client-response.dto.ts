import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ClientStatusEnum } from '../entities/oauth-client.entity';

export class OAuthClientResponseDto {
  @ApiProperty({
    description: 'Identifiant unique du client OAuth (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: "Nom de l'application cliente",
    example: 'My Web Application',
  })
  name: string;

  @ApiProperty({
    description:
      'Identifiant client généré automatiquement (utilisé pour OAuth)',
    example: 'client_abc123xyz789def456',
  })
  clientId: string;

  @Exclude()
  clientSecret: string;

  @ApiProperty({
    description: 'URI de redirection autorisée après authentification',
    example: 'http://localhost:3000/callback',
  })
  redirectUri: string;

  @ApiProperty({
    description: 'Statut du client (ACTIVE ou DISABLED)',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'DISABLED'],
  })
  status: ClientStatusEnum;

  @ApiProperty({
    description: 'Date de création du client',
    example: '2024-02-02T10:30:45.123Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière modification du client',
    example: '2024-02-02T10:30:45.123Z',
    format: 'date-time',
  })
  updatedAt: Date;
}
