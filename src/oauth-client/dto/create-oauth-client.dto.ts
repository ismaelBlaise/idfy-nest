import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOAuthClientDto {
  @ApiProperty({
    description: "Nom de l'application cliente",
    example: 'My Web Application',
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description:
      'URI de redirection autorisée après authentification (doit être valide)',
    example: 'http://localhost:3000/callback',
  })
  @IsNotEmpty()
  @IsString()
  redirectUri: string;
}
