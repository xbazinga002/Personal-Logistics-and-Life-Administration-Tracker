# Personal Logistics & Life Administration Tracker

> **Team: AdminOPs** — James Rhodes, Shane Stroud

A full-stack web application to track life admin tasks — renewals, deadlines, and recurring obligations — with a smart dashboard that surfaces overdue, due-soon, and upcoming items at a glance.

**Live demo:** [https://logistics-tracker-43yi.onrender.com](https://logistics-tracker-43yi.onrender.com)

> Heads-up: the live demo runs on Render's free tier, so the first request after a quiet period takes ~30 seconds to wake up. After that it's instant.

---

## Tech Stack

| Layer      | Tech                           |
|------------|--------------------------------|
| Frontend   | React + TypeScript (Vite)      |
| Backend    | Node.js + Express + TypeScript |
| Database   | PostgreSQL                     |
| Migrations | Knex                           |
| Auth       | JWT + bcrypt                   |

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (running locally)

---

### 1. Clone & Install

```bash
git clone https://github.com/xbazinga002/Personal-Logistics-and-Life-Administration-Tracker
cd Personal-Logistics-and-Life-Administration-Tracker
```

---

### 2. Set Up the Database

```bash
psql -U postgres -c "CREATE DATABASE logistics_tracker;"
```

---

### 3. Configure Environment

```bash
cp .env.example server/.env
# Edit server/.env with your DB credentials and JWT secret
```

---

### 4. Start the Backend

```bash
cd server
npm install
npm run migrate    # Run all Knex migrations
npm run dev        # Starts on http://localhost:3001
```

---

### 5. Start the Frontend

```bash
cd client
npm install
npm run dev        # Starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Features

| Feature | Description |
|---|---|
| **Auth** | Register / login with JWT sessions |
| **Items CRUD** | Create, view, edit, and delete life-admin tasks |
| **Dashboard** | Items grouped into Overdue / Due Soon (7 days) / Upcoming (30 days) |
| **Recurrence** | Daily, weekly, monthly, yearly — next occurrence auto-created on completion |
| **Inline create** | Add new categories and tags directly from the new-item form |
| **Draft persistence** | Form auto-saves as you type; resume right where you left off |
| **Notifications** | In-app bell for items due in 1 / 3 / 7 days and overdue items |
| **Filtering & Sorting** | Filter by status, category, tag, or date range; sort by due date |
| **Categories & Tags** | Organize items with many-to-many tag support |

---

## API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
```

### Items
```
GET    /api/items               ?status=&category_id=&tag_id=&due_from=&due_to=&sort=asc|desc
POST   /api/items
GET    /api/items/:id
PUT    /api/items/:id
DELETE /api/items/:id
POST   /api/items/:id/complete
```

### Dashboard
```
GET    /api/dashboard/summary
```

### Categories
```
GET    /api/categories
POST   /api/categories
DELETE /api/categories/:id
```

### Tags
```
GET    /api/tags
POST   /api/tags
DELETE /api/tags/:id
```

### Notifications
```
GET    /api/notifications       ?unread=true
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
```

---

## Project Structure

```
Personal-Logistics-and-Life-Administration-Tracker/
│
├── client/                      # React + TypeScript frontend (Vite)
│   └── src/
│       ├── pages/               # Login, Register, Dashboard, Items, ItemDetail
│       ├── components/          # Layout, ItemCard, ItemForm, NotificationBell, DashboardSection
│       ├── services/            # API client
│       └── types/               # Shared TypeScript interfaces & types
│
└── server/                      # Node.js + Express backend
    └── src/
        ├── routes/              # Express routers
        ├── controllers/         # Request handlers
        ├── services/            # Business logic (recurrence, urgency, notifications)
        ├── middleware/          # JWT auth, input validation
        └── db/
            ├── migrations/      # Knex migration files
            └── repositories/    # Data access layer
```

---

## Security

Security was treated as a first-class concern, not an afterthought.

| Layer | Protection |
|---|---|
| Passwords | Hashed with bcrypt before storage — never stored or logged in plaintext |
| Sessions | Signed JWTs with mandatory strong-secret enforcement at boot |
| Brute force | Auth endpoints rate-limited per IP |
| Headers | `helmet` middleware applies modern browser security defaults |
| Transport | HTTPS end-to-end (browser ↔ server, server ↔ database) |
| SQL injection | Eliminated by design — all queries go through a parameterized query builder |
| Cross-account access | Every query is scoped to the authenticated user; ownership is verified before referencing categories or tags |
| Input | Validated with Zod (client) and explicit checks (server); JSON body size capped |
| Secrets | All credentials live in environment variables, never in source control |

---

## Deployment

The app is deployed on **Render** as a single Node web service that serves both the API and the built React bundle, plus a managed PostgreSQL database.

- One-click deploy via [render.yaml](render.yaml) blueprint
- Auto-deploys on every push to `main`
- Migrations run automatically before each boot
- Database connection uses TLS

---

## Development Notes

- All timestamps are stored in UTC and converted client-side.
- Recurrence logic lives in `server/src/services/` — completing a recurring item automatically creates the next occurrence with edge-case clamping (e.g., Jan 31 + 1 month → Feb 28/29).
- Notification urgency tiers: **overdue**, **due in 1 day**, **due in 3 days**, **due in 7 days**.
- The dashboard summary endpoint (`GET /api/dashboard/summary`) returns pre-bucketed counts for the frontend widgets.
- TypeScript is used end-to-end; both client and server are type-checked in CI before deploy.

---

MIT © AdminOPs — James Rhodes & Shane Stroud
