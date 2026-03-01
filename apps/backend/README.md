# ⚙️ @soulcanvas/backend

Welcome to the SoulCanvas backend server! This is a incredibly fast **NestJS** application running on the **Bun** runtime, utilizing **tRPC** for strictly typed APIs and **Drizzle ORM** for database interaction.

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have run `bun install` at the root of the Turborepo monorepo.
You must also have a running PostgreSQL database (e.g., Neon).

### 2. Environment Setup
Create a `.env` file at the root of the project:
```env
DATABASE_URL=postgres://...
CLERK_SECRET_KEY=xxx
FRONTEND_URL=http://localhost:3001
PORT=3000
```

### 3. Database Migrations
Before running the backend, ensure your database schema is up-to-date:
```bash
# From the root of the monorepo:
cd packages/database
bun run db:push
```

### 4. Run the Development Server
```bash
# Preferably from the root of the project:
bun run dev

# Or directly in this directory:
bun run dev
```
The server runs on `http://localhost:3000` by default.

## 🏗 Architecture & Stack

- **Framework:** NestJS
- **Runtime:** Bun (Blazing fast!)
- **Database:** PostgreSQL + Drizzle ORM (via `@soulcanvas/database`)
- **API Contract:** tRPC (via `@soulcanvas/api`)
- **Security:** Helmet, rate limiting, and AES-256-GCM encryption for stored user strings.

## 🔐 Security & Payload Optimization

- **End-to-End Encryption:** Journal entries are encrypted using `AES-256-GCM` before being stored in PostgreSQL. They are only decrypted when requested by the specific verified user.
- **Payload Stripping:** To optimize network latency when requesting massive arrays of data (e.g., the Galaxy View), the backend explicitly targets and strips unneeded heavy blocks (like voice notes and images) from the compressed JSON payload before responding.
- **Rate Limiting:** Every single tRPC route is safeguarded by an in-memory sliding window rate limiter within the API contract (`packages/api`).

## 📂 Adding New Routes

You **DO NOT** add new routes inside `apps/backend/`.
Instead, you must add the route inside the `packages/api` workspace!
1. Add the schemas and the handler inside `packages/api/src/namespaces/`
2. Connect it to the `AppRouter` in `packages/api/src/router.ts`.
3. Create the required class methods inside `apps/backend/src/.../*.service.ts` and inject them as `Services` to the tRPC handler.

---
*For more detailed API documentation, read `packages/api/README.md`. For Git workflow and branching guidelines, please refer to the `DEVELOPER_WORKFLOW.md` at the root of the repo.*
