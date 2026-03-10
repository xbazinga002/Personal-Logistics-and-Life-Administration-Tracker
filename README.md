# Personal Logistics and Life Administration Tracker

Team: AdminOPs | James Rhodes, Shane Stroud

A full-stack web app to track life admin tasks — renewals, deadlines, recurring obligations — with a smart dashboard showing overdue, due-soon, and upcoming items.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript (Vite) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| Migrations | Knex |
| Auth | JWT + bcrypt |

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (running locally)

### 1. Clone & install

```bash
git clone https://github.com/xbazinga002/Personal-Logistics-and-Life-Administration-Tracker-
cd Personal-Logistics-and-Life-Administration-Tracker-
```

### 2. Set up the database

```bash
# Create the database in psql
psql -U postgres -c "CREATE DATABASE logistics_tracker;"
```

### 3. Configure environment

```bash
cp .env.example server/.env
# Edit server/.env with your DB credentials and JWT secret
```

### 4. Start the backend

```bash
cd server
npm install
npm run migrate    # run all migrations
npm run dev        # starts on http://localhost:3001
```

### 5. Start the frontend

```bash
cd client
npm install
npm run dev        # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Features

- **Auth**: Register / login with JWT sessions
- **Items CRUD**: Create, view, edit, delete life-admin tasks
- **Dashboard**: Items grouped into Overdue / Due Soon (7 days) / Upcoming (30 days)
- **Recurrence**: Weekly, monthly, yearly — next occurrence auto-created on completion
- **Notifications**: In-app bell for items due in 1/3/7 days and overdue items
- **Filtering & Sorting**: Filter by status, category, tag, date range; sort by due date
- **Categories & Tags**: Organize items with many-to-many tags

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/items               ?status=&category_id=&tag_id=&due_from=&due_to=&sort=asc|desc
POST   /api/items
GET    /api/items/:id
PUT    /api/items/:id
DELETE /api/items/:id
POST   /api/items/:id/complete

GET    /api/dashboard/summary

GET    /api/categories
POST   /api/categories
DELETE /api/categories/:id

GET    /api/tags
POST   /api/tags
DELETE /api/tags/:id

GET    /api/notifications       ?unread=true
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
```

---

## Project Structure

```
├── client/          React + TypeScript frontend
│   └── src/
│       ├── pages/   Login, Register, Dashboard, Items, ItemDetail
│       ├── components/  Layout, ItemCard, ItemForm, NotificationBell, DashboardSection
│       ├── services/    API client
│       └── types/       Shared TypeScript types
│
└── server/          Node.js + Express backend
    └── src/
        ├── routes/       Express routers
        ├── controllers/  Request handlers
        ├── services/     Business logic (recurrence, urgency, notifications)
        ├── middleware/    JWT auth, validation
        └── db/
            ├── migrations/   Knex migration files
            └── repositories/ Data access layer
```
