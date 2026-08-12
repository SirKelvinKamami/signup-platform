# Deployment Guide

## Architecture

```
Vercel (next.js)          Railway / fly.io (nest.js)     Turso (db)
  apps/web  ──API calls──>  apps/api  ──database──>  turso-db on render
```

The frontend (Next.js) is deployed on **Vercel**, the backend (NestJS) on **Railway** or **Fly.io**, and the database (Turso/libSQL) is already hosted on Render.

---

## 1. Turso Database (already configured)

The `.env` file at the root has your remote DB credentials:

```
TURSO_DB_URL=https://turso-db-8svn.onrender.com
TURSO_DB_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

Push schema changes anytime with:

```bash
pnpm db:push
```

---

## 2. Deploy NestJS API

### Option A: Railway (recommended — easier)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) and create a new project
3. Select **Deploy from GitHub repo**
4. Set the root directory to `apps/api`
5. Add these environment variables:

| Variable | Value |
|---|---|
| `TURSO_DB_URL` | `https://turso-db-8svn.onrender.com` |
| `TURSO_DB_TOKEN` | Your token |
| `JWT_SECRET` | A random 64-char string |
| `FRONTEND_URL` | Your Vercel URL (set after step 3) |
| `PORT` | `4000` |
| `NODE_VERSION` | `20` |

6. **Build command**: `cd apps/api && npx pnpm install && npx tsc`
7. **Start command**: `node dist/main.js`
8. Deploy — you'll get a URL like `https://your-api.up.railway.app`

### Option B: Fly.io (more control)

1. Install flyctl: `winget install flyctl`
2. Login: `fly auth login`
3. Create config:

```bash
cd apps/api
fly launch
```

4. Set secrets:

```bash
fly secrets set TURSO_DB_URL="https://turso-db-8svn.onrender.com"
fly secrets set TURSO_DB_TOKEN="your-token"
fly secrets set JWT_SECRET="your-secret"
fly secrets set FRONTEND_URL="https://your-app.vercel.app"
fly secrets set PORT="4000"
```

5. Deploy:

```bash
fly deploy
```

---

## 3. Deploy Next.js Frontend to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and create a new project
3. Import your GitHub repo
4. Set **Root Directory** to `apps/web`
5. Set **Framework Preset** to `Next.js`
6. Add environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | Railway/Fly.io URL (e.g., `https://your-api.up.railway.app`) |

7. Deploy

### Important: Configure Rewrites

The Next.js app already has rewrites configured in `next.config.ts`:

```ts
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
    },
  ];
}
```

This proxies all `/api/*` requests from the Vercel domain to your NestJS backend.

---

## 4. Verify Deployment

1. Visit your Vercel URL
2. Register an account
3. Create a form
4. Create a link
5. Click the link and check analytics

---

## 5. Environment Variables Summary

| Variable | Where | Purpose |
|---|---|---|
| `TURSO_DB_URL` | API env | Turso database endpoint |
| `TURSO_DB_TOKEN` | API env | Database auth token |
| `JWT_SECRET` | API env | JWT signing secret |
| `FRONTEND_URL` | API env | CORS origin |
| `PORT` | API env | NestJS listen port |
| `NEXT_PUBLIC_API_URL` | Web env | API base URL for rewrites |

---

## 6. Local Development

```bash
pnpm install         # install all deps
pnpm db:push         # push schema to Turso (or local SQLite)
pnpm dev             # starts API (4000) + Web (3000)
```

To use local SQLite instead of remote Turso, change `TURSO_DB_URL` in `.env` to:
```
TURSO_DB_URL=file:./data/signup.db
```
