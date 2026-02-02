import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOAuthClientDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  redirectUri: string;
}
