# 🏖️ Mình Đi Đâu Thế

> **An all-in-one web app for group trip planning.**
>
> From destination planning and itinerary building to group funds, room and ride coordination, and trip memories, everything lives behind a single shareable link with no app install required.

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [System Requirements](#-system-requirements)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [Authentication](#-authentication)
- [Useful Commands](#-useful-commands)
- [Folder Structure](#-folder-structure)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Architecture Overview

This project uses a **Turborepo monorepo** with the following parts:

| Component | Technology | Description |
|---|---|---|
| `apps/web` | **Next.js 16** (React 19) | Frontend Web PWA running on port `3000` |
| `apps/api` | **NestJS 10** | Backend REST API with Swagger and JWT auth running on port `3001` |
| `packages/database` | **Prisma 5** + PostgreSQL | ORM layer and database schema |
| `packages/ui` | React component library | Shared UI components |
| `packages/eslint-config` | ESLint | Shared lint configuration |
| `packages/typescript-config` | TypeScript | Shared TypeScript configuration |

```text
Browser -> Next.js (port 3000) -> NestJS API (port 3001) -> PostgreSQL
                                      |
                                 Passport.js + JWT
                                 Prisma ORM
```

### 🔐 Authentication Stack

| Component | Description |
|---|---|
| **Passport.js** | Authentication middleware with Local and JWT strategies |
| **@nestjs/jwt** | JWT signing and verification |
| **bcrypt** | Password hashing with 12 rounds |
| **Refresh Token Rotation** | Refresh tokens stored securely in the database |

---

## 💻 System Requirements

Before getting started, make sure your machine has:

| Software | Minimum Version | Check |
|---|---|---|
| **Node.js** | >= 18.x | `node -v` |
| **npm** | >= 9.x (11.x recommended) | `npm -v` |
| **PostgreSQL** | >= 14.x | `psql --version` |
| **Git** | >= 2.x | `git --version` |

> 💡 **Tip:** If PostgreSQL is not installed locally, you can use [Docker](#-run-postgresql-with-docker) instead.

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repo-url> minh-di-dau-the
cd minh-di-dau-the
```

### 2. Install dependencies

```bash
npm install
```

This installs all dependencies across apps and packages via npm workspaces.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then open `.env` and fill in the values described in the [Environment Variables](#-environment-variables) section below.

### 4. Create the database and run migrations

```bash
createdb minh_di_dau_the
npm run -w packages/database db:migrate
```

For fast local development, you can use:

```bash
npm run -w packages/database db:push
```

### 5. Generate the Prisma client

```bash
npm run -w packages/database generate
```

### 6. Start the app

```bash
npm run dev
```

Open:
- **Web app:** [http://localhost:3000](http://localhost:3000)
- **API:** [http://localhost:3001/api](http://localhost:3001/api)
- **Swagger docs:** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)

---

## ⚙️ Environment Variables

Create a root-level `.env` file with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/minh_di_dau_the
API_PORT=3001
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN_DAYS=7
```

### Configuration Guide

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string in the format `postgresql://<user>:<password>@<host>:<port>/<db>` | `postgresql://postgres:postgres@localhost:5432/minh_di_dau_the` |
| `API_PORT` | Port used by the NestJS API | `3001` |
| `JWT_SECRET` | Secret used to sign JWTs. **Change this in production.** Generate one with `openssl rand -hex 64`. | `a1b2c3d4e5...` |
| `JWT_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN_DAYS` | Refresh token validity in days | `7` |

---

## 🔐 Authentication

Authentication is implemented directly in NestJS using **Passport.js + JWT**, without relying on a third-party auth provider.

### Auth Flow

```text
1. Register/Login -> API returns { accessToken, refreshToken }
2. API Request    -> Send Authorization: Bearer <accessToken>
3. Token Expired  -> Call POST /api/auth/refresh with refreshToken
4. Logout         -> Call POST /api/auth/logout to revoke refresh token
```

### Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Register a new account |
| `POST` | `/api/auth/login` | ❌ | Log in with email and password |
| `POST` | `/api/auth/refresh` | ❌ | Refresh the access token |
| `POST` | `/api/auth/logout` | ❌ | Log out and revoke the refresh token |
| `GET` | `/api/auth/me` | ✅ JWT | Fetch the current user profile |

### Example Usage (cURL)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "Nguyen Van A"}'

curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <your-access-token>"
```

---

## 🏃 Running the App

### Development

Run all services together:

```bash
npm run dev
```

Turbo runs **Next.js** on port `3000` and **NestJS** on port `3001` in parallel.

### Run a Single App

```bash
npm run dev -w apps/web
npm run dev -w apps/api
```

### Production Build

```bash
npm run build
```

### Production Start

```bash
npm run start -w apps/web
npm run start:prod -w apps/api
```

---

## 📦 Useful Commands

### Turborepo Root

| Command | Description |
|---|---|
| `npm run dev` | Run all apps in development mode |
| `npm run build` | Build all apps |
| `npm run lint` | Run lint checks across the repository |
| `npm run format` | Format the codebase with Prettier |
| `npm run check-types` | Run TypeScript type checks |

### Database

| Command | Description |
|---|---|
| `npm run -w packages/database generate` | Generate the Prisma client |
| `npm run -w packages/database db:push` | Push schema changes to the dev database |
| `npm run -w packages/database db:migrate` | Create and run migrations |
| `npm run -w packages/database studio` | Open Prisma Studio |

### API

| Command | Description |
|---|---|
| `npm run dev -w apps/api` | Start the API in watch mode |
| `npm run build -w apps/api` | Build the API |
| `npm run test -w apps/api` | Run unit tests |
| `npm run test:e2e -w apps/api` | Run end-to-end tests |

### Web

| Command | Description |
|---|---|
| `npm run dev -w apps/web` | Start the web app in development mode |
| `npm run build -w apps/web` | Build the web app for production |
| `npm run lint -w apps/web` | Run web lint checks |

---

## 📁 Folder Structure

```text
minh-di-dau-the/
├── apps/
│   ├── web/                    # Next.js frontend PWA
│   └── api/                    # NestJS backend API
├── packages/
│   ├── database/               # Prisma ORM and schema
│   ├── ui/                     # Shared UI components
│   ├── eslint-config/          # Shared ESLint config
│   └── typescript-config/      # Shared TypeScript config
├── .env.example                # Environment variable template
├── package.json                # Root workspace package
├── turbo.json                  # Turborepo configuration
└── README.md                   # This file
```

---

## 📚 API Documentation

When the API is running, open Swagger at:

**[http://localhost:3001/api/docs](http://localhost:3001/api/docs)**

Swagger is generated from NestJS decorators and includes:
- All available endpoints
- Request and response schemas
- A built-in **Try it out** experience
- The **Authorize** button for JWT testing

---

## 🐳 Run PostgreSQL With Docker

If PostgreSQL is not installed locally, run:

```bash
docker run -d \
  --name minh-di-dau-the-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=minh_di_dau_the \
  -p 5432:5432 \
  postgres:16-alpine
```

Then set:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/minh_di_dau_the
```

---

## 🔧 Troubleshooting

### ❌ `npm install` fails

```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Prisma client is missing

```text
Error: @prisma/client did not initialize yet
```

```bash
npm run -w packages/database generate
```

### ❌ Database connection issues

1. Check that PostgreSQL is running with `pg_isready`
2. Verify that `DATABASE_URL` has the correct format
3. Make sure the `minh_di_dau_the` database exists

### ❌ `JWT_SECRET` is missing

```text
Error: secretOrPrivateKey must have a value
```

Generate a secret:

```bash
openssl rand -hex 64
```

### ❌ Port conflict

```bash
netstat -ano | findstr :3000
```

On macOS/Linux:

```bash
lsof -i :3000
```

### ❌ Turbo cache issues

```bash
npx turbo clean
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: describe change"`
4. Push the branch
5. Open a Pull Request

---

## 📄 License

Private repository. Not yet public.

---

<p align="center">
  Made with ❤️ for Vietnamese travelers
</p>
# trip-planner
