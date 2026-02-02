import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClientStatusEnum } from '../entities/oauth-client.entity';

export class UpdateOAuthClientDto {
  @ApiPropertyOptional({
    description: "Nouveau nom de l'application cliente",
    example: 'Updated Application Name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Nouvelle URI de redirection autorisée',
    example: 'http://localhost:3001/callback',
  })
  @IsOptional()
  @IsString()
  redirectUri?: string;

  @ApiPropertyOptional({
    description: 'Nouveau statut du client (ACTIVE ou DISABLED)',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'DISABLED'],
  })
  @IsOptional()
  @IsEnum(ClientStatusEnum)
  status?: ClientStatusEnum;
}
