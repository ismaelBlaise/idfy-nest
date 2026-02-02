import { Exclude } from 'class-transformer';
import { ClientStatusEnum } from '../entities/oauth-client.entity';

export class OAuthClientResponseDto {
  id: string;
  name: string;
  clientId: string;

  @Exclude()
  clientSecret: string;

  redirectUri: string;
  status: ClientStatusEnum;
  createdAt: Date;
  updatedAt: Date;
}
