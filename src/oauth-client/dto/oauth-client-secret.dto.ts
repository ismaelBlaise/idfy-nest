import { ApiProperty } from '@nestjs/swagger';
import { ClientStatusEnum } from '../entities/oauth-client.entity';

export class OAuthClientSecretDto {
  @ApiProperty({
    description:
      'Identifiant client généré (à utiliser dans les requêtes OAuth)',
    example: 'client_abc123xyz789def456',
  })
  clientId: string;

  @ApiProperty({
    description:
      "⚠️ SECRET - À conserver en lieu sûr! Ne sera retourné qu'une seule fois lors de la création. Utilisé pour authentifier le client.",
    example: 'secret_xyz789abc123def456ghi789jkl012',
  })
  clientSecret: string;

  @ApiProperty({
    description: 'Statut initial du client',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'DISABLED'],
  })
  status: ClientStatusEnum;
}
