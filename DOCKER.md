# Haven on Docker

This guide covers how Haven (Next.js 16 · TypeScript · PostgreSQL · Prisma 7 · NextAuth v5 · Groq) runs in Docker, why each piece is there, and how to explain it in an interview.

---

## TL;DR: run it

```bash
# 1. Docker Desktop must be running (Windows: uses the WSL2 backend)
# 2. You need a .env file (copy .env.example and fill it in)
docker compose up --build
# open http://localhost:3000
```

| Command | What it does |
|---|---|
| `docker compose up --build` | Builds the images, starts db → migrate → app |
| `docker compose up -d` | Same, but in the background |
| `docker compose logs -f app` | Follows the app's logs |
| `docker compose ps -a` | Shows container status (migrate should be `Exited (0)`) |
| `docker compose down` | Stops everything and **keeps** the database data |
| `docker compose down -v` | Stops everything and **deletes** the database volume |
| `docker compose exec db psql -U haven -d haven` | Opens a SQL shell in the container DB |

---

## The big picture

```
                 docker compose up --build
                            │
   ┌────────────────────────┼─────────────────────────┐
   │   Docker network "my-app_default" (internal DNS) │
   │                                                  │
   │  ┌──────────┐  healthy  ┌──────────┐  exit 0  ┌──────────┐
   │  │    db    │ ────────► │ migrate  │ ───────► │   app    │
   │  │postgres16│           │ prisma   │          │ next.js  │
   │  │  :5432   │ ◄──────── │ migrate  │          │ server.js│
   │  └────┬─────┘  db:5432  │ deploy   │          │  :3000   │
   │       │                 └──────────┘          └────┬─────┘
   │   volume "pgdata"         (one-shot job)            │
   └───────┼─────────────────────────────────────────────┼──────┘
           │ host port 5433                              │ host port 3000
       your PC (Prisma Studio, psql)               your browser
```

* **db**: official `postgres:16-alpine`. Its data lives in the named volume `pgdata`, so it survives restarts and rebuilds.
* **migrate**: a short-lived container that runs `prisma migrate deploy` and then exits. The app waits for it to exit successfully, so the app never starts against a database with missing tables.
* **app**: the slim production image running Next.js' standalone `server.js`.

Containers reach each other by **service name**. Inside Docker the database URL is `postgresql://haven:...@db:5432/haven`, not `localhost`. Inside a container, `localhost` means that container itself.

---

## Every change, file by file

### 1. `lib/prisma.ts`: Neon adapter replaced with the `pg` adapter

**Before:** `@prisma/adapter-neon` (`PrismaNeon`).
**After:** `@prisma/adapter-pg` (`PrismaPg`).

```ts
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
return new PrismaClient({ adapter });
```

**Why:** Prisma 7 always connects through a *driver adapter*. The Neon adapter uses Neon's serverless driver, which connects through Neon's own WebSocket proxy. A plain Postgres container has no such proxy, so the app couldn't connect. `pg` (node-postgres) speaks the normal Postgres protocol, so **the same code works with the Docker DB and with Neon**. I tested both: the container DB, and your Neon DB with a `SELECT 1`.

Package changes in `package.json`:

| Removed | Added | Why |
|---|---|---|
| `@prisma/adapter-neon`, `@neondatabase/serverless`, `ws`, `@types/ws` | `@prisma/adapter-pg`, `pg`, `@types/pg` | Driver swap |
| `@anthropic-ai/sdk` | – | Never imported; chat uses Groq through `fetch`. Removing it gives a smaller image |
| `prisma` 7.5.0 | `prisma` 7.8.0 | CLI and `@prisma/client` must be the same version |

### 2. `next.config.ts`: `output: "standalone"`

`next build` now also writes `.next/standalone/`. That folder holds a tiny `server.js` and **only** the parts of `node_modules` the app actually imports, which Next.js finds by tracing imports. The runtime image copies just this folder, so it doesn't need the full `node_modules`.

The Prisma 7 gotcha: Prisma 7 generates the client as TypeScript into `app/generated/prisma` (see `output` in `schema.prisma`). That folder is inside the app, so the bundler compiles it in automatically and nothing has to be copied by hand. I confirmed this by running real Prisma queries inside the container.

### 3. `Dockerfile`: multi-stage build

| Stage | Based on | Does | Ends up in the final image? |
|---|---|---|---|
| `deps` | `node:22-alpine` | `npm ci` (all packages) | No |
| `builder` | `node:22-alpine` | `prisma generate`, then `next build` | No |
| `migrator` | `deps` | `CMD prisma migrate deploy` | Separate small job image |
| `runner` | `node:22-alpine` | Copies `standalone/`, `.next/static`, `public/`, then `node server.js` | **Yes**: ~350 MB |

Key ideas, line by line:

* **`COPY package.json package-lock.json` before `COPY . .`** is layer caching. Docker reuses a layer if its inputs haven't changed, so editing a `.tsx` file doesn't re-run `npm ci`.
* **`npm ci`** installs exactly what's in the lockfile, so builds are reproducible.
* **Placeholder `DATABASE_URL` in the builder.** `prisma generate` never connects to a database, but `prisma.config.ts` reads the variable. The real URL is only provided at run time.
* **`.next/static` and `public/` are copied separately** because standalone output deliberately leaves them out.
* **`USER nextjs`.** The server doesn't run as root, which limits damage if the app is ever compromised.
* **`HOSTNAME=0.0.0.0`.** Next.js must listen on all interfaces. Otherwise it only listens inside the container, and port mapping can't reach it.
* **No secrets anywhere in the Dockerfile.** You could publish this image and leak nothing.

### 4. `.dockerignore`

This lists what is **not** sent to Docker as build context: `node_modules`, `.next`, `.git`, `app/generated`, `errors.txt` and, most importantly, **`.env` / `.env.*`**. Two benefits: builds are faster, and secrets can't end up in an image even by accident (`COPY . .` would otherwise copy `.env`).

Why skip `node_modules`? Your Windows `node_modules` contains Windows binaries such as Prisma's `schema-engine-windows.exe`. The image needs Linux ones, so it installs its own.

### 5. `docker-compose.yml`

* **`db`** has a `healthcheck` (`pg_isready`). "Container started" is not the same as "Postgres accepts connections", and the healthcheck closes that gap.
* **`migrate`** has `depends_on: db: condition: service_healthy`.
* **`app`** has `depends_on: migrate: condition: service_completed_successfully`.
* **Secrets:** `env_file: .env` passes your secrets in **when the container starts**. They are never written into the image.
* **Overrides:** values under `environment:` take priority over `env_file`. That's how `DATABASE_URL` points at `db:5432` inside Docker while your `.env` keeps pointing at Neon for `npm run dev`.
* **`AUTH_TRUST_HOST: "true"`.** NextAuth v5 rejects requests in production unless it's on Vercel or you set this.
* **Host port `5433`** for Postgres avoids a clash if you ever install Postgres on Windows.
* **Named volume `pgdata`** keeps the data until you run `docker compose down -v`.
* `${POSTGRES_PASSWORD:-haven_local_pw}` means "use the variable if it's set, otherwise the default". These are local-only credentials.

### 6. `prisma/migrations/20261117134818_init/`: first migration

The project had **no migrations folder**. The database had been built with `prisma db push`, which changes a database without keeping a history. `prisma migrate deploy` (the safe, production-style command) only applies migration files, so on a fresh database it would have created **zero tables**.

How the migration was created:

```bash
docker compose up -d db
DATABASE_URL="postgresql://haven:haven_local_pw@localhost:5433/haven" npx prisma migrate dev --name init
```

I then wiped the volume (`docker compose down -v`) and ran the whole stack from scratch. The `migrate` container created all 10 tables by itself.

> **Neon heads-up:** your Neon DB already has these tables (from `db push`). If you ever run `migrate deploy` against Neon, first mark this migration as already applied:
> `npx prisma migrate resolve --applied 20261117134818_init`

### 7. `lib/sendAssessmentEmail.ts`: Resend client created lazily

**Bug found by the Docker build:** `new Resend(process.env.RESEND_API_KEY)` ran as soon as the file was imported. `next build` imports every route to collect page data, and in Docker the build has no secrets on purpose, so the build failed with `Missing API key`.

**Fix:** create the client on first use instead:

```ts
let resendClient: Resend | null = null;
function getResend() {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}
```

Lesson: **build time and run time are different environments.** Code that runs at import time can't depend on runtime secrets.

### 8. `.gitattributes`: Windows line endings

Your git has `core.autocrlf=true`, which turns LF into CRLF when files are checked out on Windows. Linux reads the hidden `\r` literally, so a CRLF shell script fails with `/bin/sh^M: not found`. `.gitattributes` forces LF for `*.sh`, `Dockerfile`, compose and Prisma/SQL files.

### 9. `.env.example` and `.gitignore`

`.env.example` is a committed template that lists every variable the app needs, with no values. `.gitignore` gained `!.env.example` so this one file is allowed despite the `.env*` rule.

---

## How it was verified

| Check | Result |
|---|---|
| `docker compose build` | ✅ Both images build. The first attempt failed on Resend, which is fixed above |
| `migrate` on an empty volume | ✅ `All migrations have been successfully applied`, exit 0 |
| `GET /`, `/signin`, `/api/auth/providers` | ✅ 200 |
| Real Prisma query inside the container | ✅ Inserted a test user and session with SQL; `/api/auth/session` returned that user; test rows deleted afterwards |
| `pg` adapter against Neon (host) | ✅ `SELECT 1` OK |
| `npx tsc --noEmit` | ✅ No errors |
| Google sign-in in a browser | ⚠️ Not tested; needs `http://localhost:3000/api/auth/callback/google` in your Google OAuth client's redirect URIs |

---

## Windows / Docker Desktop notes

* Docker Desktop must be **running**. It uses the **WSL2** backend (your `docker-desktop` distro). If `docker` says `failed to connect to the docker API at npipe:...`, Docker Desktop isn't running yet. On first launch it may restart its engine once, so wait about 30 seconds.
* Line endings are covered by `.gitattributes` (see above).
* Building on Windows works because nothing Windows-specific goes into the image: `node_modules` is excluded and reinstalled for Linux.

---

## Interview explanations (2 lines each)

1. **Setup check:** Before writing a Dockerfile, I listed what the app needs at runtime: env vars, Prisma version and database driver. That's how I found the Neon-only adapter and the missing migrations.
2. **Driver swap:** Prisma 7 connects through driver adapters, and the Neon one only works through Neon's WebSocket proxy. I switched to `@prisma/adapter-pg`, so the same code works with a local container and with Neon.
3. **Standalone output:** `output: "standalone"` makes Next.js trace imports and produce a self-contained `server.js` with only the dependencies it needs. The runtime image ships that instead of the full `node_modules`.
4. **Multi-stage Dockerfile:** Separate stages install, build and run, and only the final small stage is shipped (~350 MB), with no compilers, dev dependencies or source. Copying the package files before the source lets Docker cache the `npm ci` layer.
5. **.dockerignore:** It keeps `node_modules`, `.next`, `.git` and especially `.env` out of the build context. Builds get faster and secrets can't leak into an image layer.
6. **Compose:** Three services with explicit startup order: Postgres healthy → migrations exit 0 → app starts. Secrets are injected at run time with `env_file`, and the DB data lives in a named volume.
7. **Migrations:** The project used `db push`, so there was no migration history and `migrate deploy` would have created nothing. I created a baseline `init` migration and ran it as a one-shot container before the app starts.
8. **Build vs runtime bug:** The build failed because the Resend client was created at import time without its API key. I made it lazy: build time has no secrets by design, so code mustn't need them at import.
