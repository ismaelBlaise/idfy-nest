# Users Module

Module pour gérer les utilisateurs de l'application avec CRUD complet, authentification et gestion des statuts.

## Structure

```
users/
├── entities/
│   ├── user.entity.ts          # Entité TypeORM User
│   └── index.ts
├── dto/
│   ├── create-user.dto.ts      # DTO pour création d'utilisateur
│   ├── update-user.dto.ts      # DTO pour mise à jour d'utilisateur
│   ├── update-user-status.dto.ts # DTO pour mise à jour du statut
│   ├── user-response.dto.ts    # DTO de réponse (sans mot de passe)
│   ├── verify-email.dto.ts     # DTO pour vérification d'email
│   └── index.ts
├── users.service.ts            # Service métier
├── users.controller.ts         # Contrôleur HTTP
├── users.module.ts             # Module NestJS
├── users.service.spec.ts       # Tests unitaires
└── index.ts
```

## Fonctionnalités

### CRUD Utilisateurs

- **Créer un utilisateur**: `POST /users`
  - Valide email unique
  - Hache le mot de passe avec bcrypt
  - Crée l'utilisateur avec statut ACTIVE

- **Récupérer tous les utilisateurs**: `GET /users`
  - Retourne les utilisateurs sans les mots de passe
  - Triés par date de création (récent d'abord)

- **Récupérer un utilisateur par ID**: `GET /users/:id`
  - Valide l'ID utilisateur
  - Lance NotFoundException si l'utilisateur n'existe pas

- **Récupérer un utilisateur par email**: `GET /users/email/:email`
  - Valide l'email
  - Lance NotFoundException si l'utilisateur n'existe pas

- **Mettre à jour un utilisateur**: `PUT /users/:id`
  - Vérifie que l'utilisateur existe
  - Hache le mot de passe si mis à jour
  - Valide l'unicité de l'email si modifié

- **Supprimer un utilisateur**: `DELETE /users/:id`
  - Suppression permanente de la base de données

### Gestion des Statuts

- **Désactiver un utilisateur**: `PUT /users/:id/disable`
  - Change le statut à DISABLED

- **Activer un utilisateur**: `PUT /users/:id/enable`
  - Change le statut à ACTIVE

### Vérification d'Email

- **Vérifier l'email**: `PUT /users/:id/verify-email`
  - Marque emailVerified à true

## Entité User

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // ID unique (UUID)

  @Column({ unique: true })
  email: string; // Email unique

  @Column()
  password: string; // Mot de passe hashé

  @Column()
  firstName: string; // Prénom

  @Column()
  lastName: string; // Nom de famille

  @Column({ enum: UserStatus })
  status: UserStatus; // ACTIVE | DISABLED

  @Column({ default: false })
  emailVerified: boolean; // État de vérification d'email

  @CreateDateColumn()
  createdAt: Date; // Date de création

  @UpdateDateColumn()
  updatedAt: Date; // Date de mise à jour
}
```

## DTOs

### CreateUserDto

```typescript
{
  email: string; // Email valide unique
  password: string; // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  firstName: string; // Min 2 chars, Max 50 chars
  lastName: string; // Min 2 chars, Max 50 chars
}
```

### UpdateUserDto

```typescript
{
  email?: string;                // Optionnel, valide unique
  password?: string;             // Optionnel, même validation que create
  firstName?: string;            // Optionnel, même validation que create
  lastName?: string;             // Optionnel, même validation que create
}
```

### UserResponseDto

```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  // IMPORTANT: password est exclus automatiquement
}
```

## Sécurité

- ✅ Les mots de passe sont hashés avec bcrypt (SALT_ROUNDS: 10)
- ✅ Les DTOs utilisent class-validator pour valider les entrées
- ✅ Les mots de passe ne sont jamais retournés dans les réponses
- ✅ Les emails sont uniques et validés
- ✅ Les statuts sont gérés via enum TypeORM
- ✅ Gestion des erreurs centralisée avec exceptions NestJS

## Validation

### Email

- Doit être un email valide
- Doit être unique dans la base de données

### Mot de passe

- Minimum 8 caractères
- Maximum 50 caractères
- Au moins 1 lettre majuscule
- Au moins 1 lettre minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial (@$!%\*?&)

### Prénom/Nom de famille

- Minimum 2 caractères
- Maximum 50 caractères

## Logging

Chaque action est loggée avec :

- ✅ Succès des créations/mises à jour/suppressions
- ✅ Tentatives échouées
- ✅ Erreurs système

## Tests

```bash
# Exécuter les tests unitaires
npm run test src/users/users.service.spec.ts

# Exécuter avec couverture
npm run test:cov src/users/users.service.spec.ts
```

## Exemple d'utilisation

### Créer un utilisateur

```bash
POST /users
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "status": "ACTIVE",
  "emailVerified": false,
  "createdAt": "2024-02-02T10:00:00Z",
  "updatedAt": "2024-02-02T10:00:00Z"
}
```

### Récupérer un utilisateur

```bash
GET /users/123e4567-e89b-12d3-a456-426614174000
```

### Mettre à jour un utilisateur

```bash
PUT /users/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "firstName": "Johnny"
}
```

### Vérifier l'email

```bash
PUT /users/123e4567-e89b-12d3-a456-426614174000/verify-email
```

### Désactiver un utilisateur

```bash
PUT /users/123e4567-e89b-12d3-a456-426614174000/disable
```

## Erreurs

- `BadRequestException (400)`: Données invalides ou manquantes
- `ConflictException (409)`: Email déjà utilisé
- `NotFoundException (404)`: Utilisateur non trouvé
- `InternalServerErrorException (500)`: Erreur serveur

## Variables d'environnement

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=idfy_db
NODE_ENV=development
```
