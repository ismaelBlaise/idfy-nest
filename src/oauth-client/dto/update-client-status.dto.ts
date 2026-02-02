import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClientStatusEnum } from '../entities/oauth-client.entity';

export class UpdateClientStatusDto {
  @ApiProperty({
    description: 'Nouveau statut du client OAuth',
    example: 'DISABLED',
    enum: ['ACTIVE', 'DISABLED'],
  })
  @IsEnum(ClientStatusEnum)
  status: ClientStatusEnum;
}
