import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nouvelle adresse email (doit être unique)',
    example: 'newemail@example.com',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description:
      'Nouveau mot de passe (min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial)',
    example: 'NewPassword456!',
    minLength: 8,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, {
    message: 'Password must be at least 8 characters long',
  })
  @MaxLength(50, {
    message: 'Password must not exceed 50 characters',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'Nouveau prénom',
    example: 'Jean-Michel',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, {
    message: 'First name must be at least 2 characters long',
  })
  @MaxLength(50, {
    message: 'First name must not exceed 50 characters',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Nouveau nom de famille',
    example: 'Dupont-Martin',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, {
    message: 'Last name must be at least 2 characters long',
  })
  @MaxLength(50, {
    message: 'Last name must not exceed 50 characters',
  })
  lastName?: string;
}
