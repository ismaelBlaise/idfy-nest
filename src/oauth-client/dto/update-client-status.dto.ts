import { IsEnum } from 'class-validator';
import { ClientStatusEnum } from '../entities/oauth-client.entity';

export class UpdateClientStatusDto {
  @IsEnum(ClientStatusEnum)
  status: ClientStatusEnum;
}
