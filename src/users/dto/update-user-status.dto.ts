/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsOptional } from 'class-validator';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, { message: 'Status must be either ACTIVE or DISABLED' })
  @IsOptional()
  status?: UserStatus;
}
