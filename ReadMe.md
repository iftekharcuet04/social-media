# Social Media Management System

A professional social media management backend built with NestJS and Prisma, designed to handle multi-platform connections, media publishing, and automated interactions with high performance and reliability.

## 🚀 Core Features

- **Multi-Platform Integration**: Seamlessly connect and manage Facebook, Instagram, and LinkedIn accounts using a standardized Strategy Pattern.
- **Multi-Tenant Security**: Full JWT authentication layer that isolates data per user, ensuring secure account management.
- **Automated Feed Ingestion**: High-throughput ingestion of social feeds using recursive retry, exponential backoff, and DB concurrency management.
- **Centralized Connection Management**: A unified gateway to manage OAuth lifecycles, access tokens, and long-lived session refreshing.

## 🏗️ Technical Foundation (Engineering Standards)

This project follows premium engineering standards to ensure production-grade reliability:

### 1. OAuth Strategy Pattern
The system uses a pluggable strategy architecture for social platforms. Each provider (Facebook, Instagram, etc.) implements a standard `ConnectionAuthStrategy`, encapsulating:
- Platform-specific Login URLs.
- Token exchange logic (short-lived to long-lived).
- Automated background refreshing of expired tokens.

### 2. Multi-Tenant Data Isolation
- **Security**: All requests are protected by a `JwtAuthGuard` that injects the user context.
- **Persistence**: Every database record (connections, posts, feeds) is cryptographically scoped to the `userId`, preventing any cross-tenant data leakage.

### 3. Database & Concurrency
- **Concurrency Limiting**: Integrated `ConcurrencyLimiterService` ensures the database is never overwhelmed by limiting active queries.
- **Global Settings**: OAuth credentials (Client IDs/Secrets) are managed via the `PlatformSetting` model, allowing for global configuration updates without redeployment.

### 4. Internationalization (i18n)
- **Multi-language Support**: Full translation support for API responses using localized JSON files.
- **Smart Detection**: Automatically detects user language preference from the `Accept-Language` header.

## 📂 Project Structure

```text
src/
├── common/                     # Shared logic and cross-cutting concerns
├── modules/                    # Domain-specific logic
│   ├── auth/                   # JWT Auth, Registration & Login
│   ├── connection/             # Unified social account management
│   ├── facebook/               # FB Strategy implementation
│   ├── instagram/              # IG Strategy implementation
│   ├── ingestion/              # High-throughput automated feed ingestion
│   ├── interfaces/             # Auth & Publisher Strategy definitions
│   └── social-media-post/      # Core post orchestration logic
├── prisma/                     # Database client & extensions
└── repositories/               # Data access layer
    ├── platform-setting.repository.ts # Global OAuth credentials
    ├── user.repository.ts             # User data management
    ├── connection.repository.ts       # Social account storage
    └── post.repository.ts             # Social media post storage
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL

### Installation
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init_multi_tenant_auth
```

### Environment Setup
Create a `.env` file with the following variables:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/social_db?connection_limit=20"
JWT_SECRET="your_super_secret_jwt_key"
PORT=3000
DB_CONCURRENCY=20
```

> [!IMPORTANT]
> **Social Platform Credentials**: Facebook and Instagram `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URI` are now stored in the `platform_settings` table in the database. You must seed these values after running migrations for the connection flow to work.

### Running the App
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start
```

## 🧪 Testing
```bash
# Run unit tests
npm run test

# Run E2E verification
npm run test:e2e
```

## 📖 Documentation
- **API Prefix**: All routes are prefixed with `/api` by default.
- **Locales**: Translation files are located in `./locales`.