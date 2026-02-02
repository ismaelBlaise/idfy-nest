import { ClientStatusEnum } from '../entities/oauth-client.entity';

export class OAuthClientSecretDto {
  clientId: string;
  clientSecret: string;
  status: ClientStatusEnum;
}
