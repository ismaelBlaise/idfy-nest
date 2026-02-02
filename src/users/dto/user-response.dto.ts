import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: "Identifiant unique de l'utilisateur (UUID)",
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'jean.dupont@example.com',
    format: 'email',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: "Prénom de l'utilisateur",
    example: 'Jean',
  })
  @Expose()
  firstName: string;

  @ApiProperty({
    description: "Nom de famille de l'utilisateur",
    example: 'Dupont',
  })
  @Expose()
  lastName: string;

  @ApiProperty({
    description: "Statut de l'utilisateur (ACTIVE ou DISABLED)",
    example: 'ACTIVE',
    enum: ['ACTIVE', 'DISABLED'],
  })
  @Expose()
  status: string;

  @ApiProperty({
    description: "Indique si l'adresse email a été vérifiée",
    example: false,
    type: Boolean,
  })
  @Expose()
  emailVerified: boolean;

  @ApiProperty({
    description: 'Date de création du compte',
    example: '2024-02-02T10:30:45.123Z',
    format: 'date-time',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Date de dernière modification du compte',
    example: '2024-02-02T10:30:45.123Z',
    format: 'date-time',
  })
  @Expose()
  updatedAt: Date;
}
