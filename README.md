# HRPulse Employee Management

React employee management app with a Node.js/Express backend and a local SQLite database.

## Prerequisites

- Node.js 20 or newer
- npm

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create an environment file:

   ```bash
   cp .env.example .env
   ```

3. Start the app and API server:

   ```bash
   npm run dev
   ```

4. Open the app:

   ```text
   http://localhost:3000
   ```

## Default Login

```text
Email: admin@hrpulse.com
Password: admin123
```

## Backend

The backend lives in `server.ts` and exposes routes under `/api`.

- `POST /api/auth/login`
- `GET /api/employees`
- `POST /api/employees`
- `GET /api/departments`
- `POST /api/departments`
- `GET /api/attendance/status`
- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `GET /api/payroll`
- `GET /api/analytics/summary`
- `GET /api/health`

## Deployment

This repo is ready for a split deployment:

- Frontend: Vercel
- Backend/API: Render

Deploy the Render backend first, then use its public URL when configuring Vercel.

### Render Backend

Create a Render Web Service from this GitHub repo.

```text
Runtime: Node
Branch: main
Build Command: npm ci
Start Command: npm run start
Health Check Path: /api/health
```

Required Render environment variables:

```text
NODE_VERSION=22
NODE_ENV=production
JWT_SECRET=<use-a-long-random-secret>
CLIENT_URLS=https://your-vercel-app.vercel.app
DATABASE_PATH=/tmp/database.sqlite
```

After Vercel gives you the final frontend URL, update `CLIENT_URLS` in Render. For multiple allowed frontend URLs, separate them with commas:

```text
CLIENT_URLS=https://your-vercel-app.vercel.app,https://your-custom-domain.com
```

SQLite note: Render free web services use an ephemeral filesystem, so `/tmp/database.sqlite` will reset on redeploy/restart/spin-down. For persistent SQLite data, attach a paid Render disk mounted at `/var/data` and change `DATABASE_PATH` to `/var/data/database.sqlite`. For a production system, moving the database to Postgres is recommended.

### Vercel Frontend

Create a Vercel project from this GitHub repo.

```text
Framework Preset: Vite
Build Command: npm run vercel-build
Output Directory: dist
Install Command: npm ci
```

Required Vercel environment variable:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

Set `VITE_API_BASE_URL` for Production and Preview environments. Vite exposes frontend variables only when they are prefixed with `VITE_`.

### Local Production Check

```bash
npm run lint
npm run build
npm run start
```

Then open:

```text
http://localhost:3000
```

## Database

SQLite is initialized from `src/lib/db.ts`. On first run, the app creates `database.sqlite` in the project root, creates the required tables, and seeds default departments, an admin user, and sample payroll data.

The SQLite database file is ignored by Git so local application data does not get committed.
