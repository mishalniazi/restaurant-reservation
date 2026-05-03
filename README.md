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
npm run dev                 # starts on port 3000
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
npm start                   # starts on port 3001 (proxies API to 3000)
```

### 4. Tests
```bash
cd backend
npm test
```

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | public | Register customer |
| POST | /api/auth/login | public | Login |
| GET | /api/tables/availability | public | Check available tables |
| GET | /api/tables | auth | List all tables |
| POST | /api/tables | admin | Add table |
| PUT | /api/tables/:id | admin | Update table |
| DELETE | /api/tables/:id | admin | Delete table |
| GET | /api/reservations | auth | List reservations (search/filter/sort/paginate) |
| POST | /api/reservations | auth | Create reservation |
| POST | /api/reservations/walkin | staff/admin | Add walk-in |
| GET | /api/reservations/:id | auth | Get reservation |
| PUT | /api/reservations/:id | auth | Update reservation |
| PUT | /api/reservations/:id/status | staff/admin | Update status |
| DELETE | /api/reservations/:id | auth | Cancel reservation |
| GET | /api/waitlist | auth | List waitlist entries |
| POST | /api/waitlist | auth | Join waitlist |
| PUT | /api/waitlist/:id/notify | staff/admin | Notify customer |
| DELETE | /api/waitlist/:id | auth | Leave waitlist |
