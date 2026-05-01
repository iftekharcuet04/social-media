# Social Media Management System

A professional social media management backend built with NestJS and Prisma, designed to handle multi-platform connections, media publishing, and automated interactions with high performance and reliability.

## Core Features

- **Multi-Platform Integration**: Seamlessly connect and manage Facebook, Instagram, and LinkedIn accounts.
- **Automated Feed Ingestion**: High-throughput ingestion of social feeds using recursive retry, exponential backoff, and DB concurrency management.
- **Media Publishing**: Robust pipeline for publishing posts and managing media across different social platforms.
- **Connection Management**: Automated handling of access tokens, refresh tokens, and account metadata.

## Technical Foundation (Engineering Standards)

This project follows premium engineering standards to ensure production-grade reliability:

### 1. Database & Concurrency
- **Concurrency Limiting**: Integrated `ConcurrencyLimiterService` ensures the database is never overwhelmed by limiting active queries to 20 and total capacity to 150.
- **Optimized Pooling**: Configured with professional-grade connection pooling (`connection_limit=20`) to prevent connection exhaustion.
- **Slow Query Tracking**: Automatic alerts for any database operations exceeding 2000ms.

### 2. Internationalization (i18n)
- **Multi-language Support**: Full translation support for API responses using localized JSON files.
- **Smart Detection**: Automatically detects user language preference from the `Accept-Language` header.

### 3. API Reliability & Monitoring
- **Standardized Responses**: All API responses follow a unified structure for easier frontend integration.
- **Global Error Handling**: Centralized exception filtering that provides clear, localized error messages.
- **Health Monitoring**: Built-in `/health` and `/health-details` endpoints for system status tracking.

### 4. Software Design Patterns
- **Strategy Pattern**: Extensible social media publishing pipeline using `PublisherStrategy` allowing zero if/else complexity for platform orchestration.
- **Repository Pattern**: Strict data access abstraction separating business logic from database (Prisma) operations.

## Project Structure

```text
src/
├── common/                     # Shared logic and cross-cutting concerns
│   ├── api.constant.ts         # Global API constants (URLs, etc.)
│   ├── platform-capabilities.service.ts # Platform-specific logic
│   ├── filters/                # Global Exception Filters
│   ├── interceptors/           # Global Response Interceptors
│   └── services/               # Infrastructure services
│       ├── concurrency-limiter.service.ts # DB Load management
│       └── translation.service.ts         # i18n logic
├── config/                     # Typed configuration (App, API)
├── locales/                    # i18n JSON files (en, es, etc.)
├── modules/                    # Domain-specific logic
│   ├── facebook/               # Facebook platform integration
│   ├── ingestion/              # High-throughput automated feed ingestion
│   ├── instagram/              # Instagram platform integration
│   ├── linkedin/               # LinkedIn platform integration
│   └── social-media-post/      # Core post orchestration logic
├── prisma/                     # Database client & extensions
└── repositories/               # Data access layer
    ├── base-repository.ts      # Abstract base for CRUD
    ├── connection.repository.ts # Account connection storage
    └── post.repository.ts       # Social media post storage
test/                           # Test suites
├── app.e2e-spec.ts             # Global app flow tests
├── architecture.e2e-spec.ts    # Filter/Limiter verification
└── ...spec.ts                  # Unit tests
```

## Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL
- Docker (optional)

### Installation
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### Environment Setup
Create a `.env` file with the following variables:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/social_db?connection_limit=20"
PORT=3000
DB_CONCURRENCY=20
```

### Running the App
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start
```

## Testing
The project includes a comprehensive test suite covering architecture, concurrency, and core functionality.
```bash
# Run unit tests
npm run test

# Run E2E verification
npm run test:e2e
```

## Documentation
- **API Prefix**: All routes are prefixed with `/api` by default.
- **Locales**: Translation files are located in `./locales`.