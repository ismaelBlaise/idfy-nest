import { IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateOAuthClientDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  redirectUri: string;
}
