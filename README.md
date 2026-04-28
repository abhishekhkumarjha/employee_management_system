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

## Database

SQLite is initialized from `src/lib/db.ts`. On first run, the app creates `database.sqlite` in the project root, creates the required tables, and seeds default departments, an admin user, and sample payroll data.

The SQLite database file is ignored by Git so local application data does not get committed.
