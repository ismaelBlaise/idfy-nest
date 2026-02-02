import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ClientStatusEnum } from '../entities/oauth-client.entity';

export class UpdateOAuthClientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;

  @IsOptional()
  @IsEnum(ClientStatusEnum)
  status?: ClientStatusEnum;
}
