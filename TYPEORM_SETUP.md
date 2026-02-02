# Quick Start Guide - TypeORM Setup

## 📋 What's Been Set Up

A complete TypeORM architecture for your NestJS project with:

- **4 Database Entities** (User, OAuthClient, Token, AuthorizationCode)
- **4 Custom Repositories** with built-in methods
- **TypeORM Configuration** with PostgreSQL support
- **Database Module** that exports all repositories for dependency injection

## 🚀 Getting Started (3 Steps)

### Step 1: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your PostgreSQL credentials
nano .env
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start the Application

```bash
npm run start:dev
```

✅ **Done!** Tables are created automatically in development mode.

## 📁 Directory Structure

```
src/database/
├── config/
│   └── typeorm.config.ts          # TypeORM configuration
├── entities/
│   ├── user.entity.ts
│   ├── oauth-client.entity.ts
│   ├── token.entity.ts
│   ├── authorization-code.entity.ts
│   └── index.ts
├── repositories/
│   ├── user.repository.ts
│   ├── oauth-client.repository.ts
│   ├── token.repository.ts
│   ├── authorization-code.repository.ts
│   └── index.ts
├── migrations/                     # Add migrations here
├── database.module.ts              # Main database module
├── data-source.ts                  # For CLI migrations
├── README.md                       # Detailed documentation
└── index.ts                        # Export module
```

## 💡 Usage Examples

### In Your Services

```typescript
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../database';

@Injectable()
export class MyService {
  constructor(private userRepository: UserRepository) {}

  async getUser(id: string) {
    return this.userRepository.findById(id);
  }

  async createUser(email: string, password: string) {
    return this.userRepository.createUser({ email, password });
  }
}
```

### Inject Any Repository

All repositories are automatically available:

- `UserRepository`
- `OAuthClientRepository`
- `TokenRepository`
- `AuthorizationCodeRepository`

## 🔗 Database Tables

| Table               | Purpose                          |
| ------------------- | -------------------------------- |
| users               | User accounts and profiles       |
| oauth_clients       | OAuth application configurations |
| tokens              | Access and refresh tokens        |
| authorization_codes | OAuth authorization codes        |
| \_migrations        | Migration history                |

## 🛠️ Useful Commands

```bash
# Development
npm run start:dev

# Create a new migration
npx typeorm migration:create src/database/migrations/MigrationName

# Run migrations
npx typeorm migration:run -d src/database/data-source.ts

# Revert last migration
npx typeorm migration:revert -d src/database/data-source.ts

# View migration status
npx typeorm migration:show -d src/database/data-source.ts

# Run tests
npm test
```

## 📚 Documentation

For detailed documentation, see [src/database/README.md](src/database/README.md)

## ⚠️ Important Notes

- **Development Mode**: `synchronize: true` - tables auto-created
- **Production Mode**: Use migrations instead
- **Cascade Delete**: Child records auto-deleted when parent is deleted
- **PostgreSQL**: Project requires PostgreSQL database

## 🐳 Using Docker (Optional)

If you don't have PostgreSQL installed:

```bash
# Start PostgreSQL in Docker
docker run --name postgres-idfy \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16

# Update .env with: DB_PASSWORD=postgres
```

## ❓ Troubleshooting

### Connection Error

- Check PostgreSQL is running
- Verify credentials in .env
- Ensure database exists: `CREATE DATABASE idfy_db;`

### Tables Not Created

- Development mode auto-creates tables
- Check server logs for errors
- Restart the application

### Migration Issues

- See [src/database/migrations/README.md](src/database/migrations/README.md)

---

**Ready to build!** 🎉
