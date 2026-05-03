# Restaurant Table Reservation & Waitlist Platform

## Stack
- **Frontend**: React, React Router v6, Redux Toolkit, TanStack Table
- **Backend**: Node.js, Express, PostgreSQL, TypeORM (EntitySchema / JS)

## Setup

### 1. Database
Create a PostgreSQL database named `restaurant_db`.

### 2. Backend
```bash
cd backend
cp .env.example .env        # fill in your DB credentials & JWT_SECRET
npm install
node src/seed.js            # seed default users & tables
npm run dev                 # starts on port 5000
```

Default accounts after seed:
| Role     | Email                    | Password  |
|----------|--------------------------|-----------|
| Admin    | admin@restaurant.com     | admin123  |
| Staff    | staff@restaurant.com     | staff123  |
| Customer | john@email.com           | pass123   |

### 3. Frontend
```bash
cd frontend
npm install
npm start                   # starts on port 3000
```

### 4. Tests
```bash
cd backend
npm test
```

## API Endpoints
| Method | Path | Auth |
|--------|------|------|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| GET | /api/tables/availability | public |
| GET/POST | /api/tables | auth |
| GET/POST | /api/reservations | auth |
| PUT | /api/reservations/:id/status | staff/admin |
| POST | /api/reservations/walkin | staff/admin |
| GET/POST/DELETE | /api/waitlist | auth |
| PUT | /api/waitlist/:id/notify | staff/admin |
