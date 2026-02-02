import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: "Adresse email unique de l'utilisateur",
    example: 'jean.dupont@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description:
      'Mot de passe sécurisé (min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial)',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 50,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
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
  password: string;

  @ApiProperty({
    description: "Prénom de l'utilisateur",
    example: 'Jean',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, {
    message: 'First name must be at least 2 characters long',
  })
  @MaxLength(50, {
    message: 'First name must not exceed 50 characters',
  })
  firstName: string;

  @ApiProperty({
    description: "Nom de famille de l'utilisateur",
    example: 'Dupont',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, {
    message: 'Last name must be at least 2 characters long',
  })
  @MaxLength(50, {
    message: 'Last name must not exceed 50 characters',
  })
  lastName: string;
}
