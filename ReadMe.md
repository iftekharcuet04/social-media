# Social Media Management System

A professional social media management backend built with NestJS and Prisma, designed to handle multi-platform connections, media publishing, and automated feed ingestion with production-grade reliability.

---

## 🚀 Core Features

- **Multi-Platform Integration**: Seamlessly connect and manage Facebook, Instagram, and LinkedIn accounts using a standardized Strategy Pattern.
- **Multi-Tenant Security**: Full JWT authentication layer that isolates data per user, ensuring secure account management.
- **Automated Feed Ingestion**: High-throughput ingestion of social feeds using recursive retry, exponential backoff, and DB concurrency management.
- **Centralized Connection Management**: A unified gateway to manage OAuth lifecycles, access tokens, and long-lived session refreshing.

---

## 🏗️ Architecture

The application follows **Pure Constructor Injection (Pure DI)** — no `ModuleRef` lazy-lookups, no `forwardRef`, no circular dependencies. Services communicate through shared interfaces and injection tokens.

### Final Dependency Graph (No Cycles)

The module import chain is strictly linear — no module ever imports a module that depends on it.

```mermaid
flowchart TD
    AppModule --> ConnectionModule
    AppModule --> SocialMediaPostModule
    SocialMediaPostModule --> ConnectionModule
    ConnectionModule --> FacebookModule
    ConnectionModule --> InstagramModule
    ConnectionModule -- provides --> ITokenRefresher["ITokenRefresher (TOKEN_REFRESHER)"]
    FacebookModule --> IngestionModule
    InstagramModule --> IngestionModule
    IngestionModule --> ITokenRefresher
```

> `IngestionModule` depends only on the `ITokenRefresher` interface, not on `ConnectionModule` directly.
> This is the key that breaks the circular dependency chain.

### Key Design Tokens

| Token | Type | Usage |
|---|---|---|
| `TOKEN_REFRESHER` | `Symbol` | Abstracts `ConnectionService.refreshToken()` so `IngestionModule` has no dependency on `ConnectionModule` |
| `AUTH_STRATEGIES` | `Symbol` | `ConnectionService` receives all platform auth strategies as an injected array — no dynamic imports |
| `POST_STRATEGIES` | `string` | `PublisherService` receives all platform publish strategies as an injected array |

### Module Responsibilities

| Module | Responsibility |
|---|---|
| `ConnectionModule` | OAuth flow, token refresh, platform strategy orchestration — **composition root** |
| `FacebookModule` | Facebook Graph API client, auth, feed sync |
| `InstagramModule` | Instagram Graph API client, auth, feed sync |
| `IngestionModule` | Platform-agnostic feed ingestion with retry/backoff |
| `SocialMediaPostModule` | Post creation, scheduling, and BullMQ queue management |
| `RepositoryModule` | Shared Prisma repository access |

### Engineering Standards

#### 1. Pure DI Architecture
- **Zero circular dependencies**: All modules form a clean linear import chain.
- **Interface-based decoupling**: High-level modules depend on abstractions (`ITokenRefresher`), not concrete services.
- **Asynchronous Processing**: High-latency tasks like publishing posts are offloaded to **BullMQ** (Redis) background queues.

#### 2. OAuth Strategy Pattern
Each provider (Facebook, Instagram, etc.) implements a standard `ConnectionAuthStrategy`, encapsulating:
- Platform-specific Login URL generation.
- Token exchange logic (short-lived → long-lived).
- Automated background refreshing of expired tokens.

#### 3. Multi-Tenant Security & Rate Limiting
- **Authentication**: All requests are protected by a `JwtAuthGuard` that injects the user context.
- **Data Isolation**: Every database record is scoped to the `userId`, preventing cross-tenant leakage.
- **Throttling**: A global `ThrottlerGuard` protects the API (10 requests per 60 seconds by default).

#### 4. Database & Concurrency
- **Concurrency Limiting**: `ConcurrencyLimiterService` prevents DB connection pool exhaustion.
- **Global Settings**: OAuth credentials are managed via the `platform_settings` table — no redeployment needed for credential rotation.

#### 5. Observability & Monitoring
- **Structured Logging**: `nestjs-pino` outputs JSON logs in production, pretty-prints in development.
- **Health Checks**: `/health` endpoint actively pings PostgreSQL and Redis.

#### 6. Centralized Error Handling
The system implements a unified error handling strategy for all third-party social APIs:
- **Automatic Parsing**: `SocialMediaErrorParser` converts raw Axios/platform errors into strongly typed `SocialMediaException`s (Auth, Rate Limit, API).
- **Global Filter**: `SocialMediaExceptionFilter` standardizes error responses for the frontend:
    ```json
    {
      "statusCode": 401,
      "platform": "FACEBOOK",
      "message": "Session expired",
      "isRetryable": false,
      "timestamp": "ISO-TIMESTAMP"
    }
    ```
- **Resilience**: Errors are tagged with `isRetryable`, allowing workers like `FeedIngestionService` to handle exponential backoff automatically based on domain logic instead of string matching.

---

## 📂 Project Structure

```text
src/
├── common/                     # Shared logic and cross-cutting concerns
├── modules/                    # Domain-specific logic
│   ├── auth/                   # JWT Auth, Registration & Login
│   ├── connection/             # Unified social account management (composition root)
│   ├── facebook/               # Facebook Strategy implementation
│   ├── instagram/              # Instagram Strategy implementation
│   ├── ingestion/              # High-throughput automated feed ingestion
│   ├── interfaces/             # Auth & Publisher Strategy definitions + DI tokens
│   └── social-media-post/      # Core post orchestration logic
├── prisma/                     # Database client & extensions
└── repositories/               # Data access layer
    ├── platform-setting.repository.ts
    ├── user.repository.ts
    ├── connection.repository.ts
    └── post.repository.ts
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL
- Redis

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
Create a `.env` file:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/social_db?connection_limit=20"
JWT_SECRET="your_super_secret_jwt_key"
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
DB_CONCURRENCY=20
```

> [!IMPORTANT]
> **Social Platform Credentials**: Facebook and Instagram `CLIENT_ID`, `CLIENT_SECRET`, and `REDIRECT_URI` are stored in the `platform_settings` table. You must seed these values after running migrations for the OAuth flow to work.

### Running the App
```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start
```

### 🐳 Docker Support
```bash
# Start all services (API, PostgreSQL, Redis, Adminer)
docker-compose up --build
```

| Service | URL |
|---|---|
| API | http://localhost:3001 |
| Adminer (DB UI) | http://localhost:1080 |
| Redis | localhost:6380 |
| Database | localhost:5433 |

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 📖 API & Monitoring

| Endpoint | Description |
|---|---|
| `/api` | Swagger interactive API documentation |
| `/admin/queues` | BullBoard — monitor background jobs |
| `/health` | Health check (PostgreSQL + Redis) |

---

## ➕ Adding a New Platform

1. Create `src/modules/<platform>/<platform>.module.ts`
2. Implement `ConnectionAuthStrategy` interface for OAuth
3. Implement `PublisherStrategy` interface for posting
4. Add the auth service to the `AUTH_STRATEGIES` factory in `ConnectionModule`
5. Add the publisher strategy to the `POST_STRATEGIES` factory in `SocialMediaPostModule`

No other files need to change.