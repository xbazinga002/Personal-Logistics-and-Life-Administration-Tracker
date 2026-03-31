# Milestone 2: Design and Implementation Progress

**Project:** Personal Logistics and Life Administration Tracker
**Team:** AdminOPs
**Members:** James Rhodes, Shane Stroud **Date:** 3/30/2026
**Course:** CS 47103 Section 70

---

## 1. System Architecture & Design

The Personal Logistics and Life Administration Tracker is built as a full-stack web application using a three-tier architecture: a React + TypeScript frontend, a Node.js + Express + TypeScript REST API backend, and a PostgreSQL relational database managed through Knex migrations.

The frontend communicates exclusively with the backend through a versioned REST API. The backend enforces JWT-based authentication on all protected routes and applies business logic in a dedicated service layer, keeping controllers thin and repositories focused on data access only. No business logic lives in the database or the frontend.

**Architecture layers:**

- **Client** — React + TypeScript (Vite), responsible for rendering UI, managing local state, and consuming the API through a centralized service module
- **Server** — Node.js + Express + TypeScript, organized into routes, controllers, services, middleware, and repositories
- **Database** — PostgreSQL with Knex migrations for schema versioning and Knex query builders for all data access

**Design decisions and rationale:**

- **JWT over sessions** — Stateless authentication allows the API to scale horizontally without shared session storage. Tokens are signed with a secret and expire after 24 hours.
- **Repository pattern** — All database queries are isolated in repository files. Controllers never touch Knex directly, which keeps the query layer independently testable and swappable.
- **Service layer** — Business logic like recurrence auto-creation, urgency calculation, and notification generation lives in service files, not controllers. This keeps HTTP concerns separate from domain logic.
- **Knex migrations** — Schema changes are versioned and repeatable across environments. No manual SQL is required to set up or update the database.
- **Many-to-many tags** — Items support multiple tags through a join table (`item_tags`), giving users flexible categorization without duplicating item records.

**System architecture diagram:**

```
┌─────────────────────────────────────┐
│           React Frontend            │
│  Pages: Login, Register, Dashboard  │
│         Items, ItemDetail           │
│  Components: ItemCard, ItemForm,    │
│   NotificationBell, DashboardSection│
│  Services: API client (fetch/axios) │
└────────────────┬────────────────────┘
                 │ HTTP / REST API
                 ▼
┌─────────────────────────────────────┐
│        Express Backend (Node.js)    │
│  Routes → Controllers → Services   │
│  Middleware: JWT Auth, Validation   │
│  Repositories → Knex query builders │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│           PostgreSQL Database       │
│  Tables: users, items, categories,  │
│  tags, item_tags, notifications     │
│  Managed via Knex migrations        │
└─────────────────────────────────────┘
```

---

## 2. Front-End Development

The frontend is built with React 18, TypeScript, and Vite. Routing is handled by React Router. API communication uses a centralized service module so all fetch logic is in one place and easily updated.

**Pages implemented:**

- **Login / Register** — JWT auth flow, form validation, error messaging, token storage in localStorage
- **Dashboard** — Fetches summary from `/api/dashboard/summary` and groups items into Overdue, Due Soon (7 days), and Upcoming (30 days) sections using the `DashboardSection` component
- **Items** — Full item list with filter controls for status, category, tag, and date range; sortable by due date ascending or descending
- **ItemDetail** — View, edit, delete, and complete individual items; shows recurrence info and tag list
- **ItemForm** — Shared create/edit form with controlled inputs, date picker, category select, tag multi-select, and recurrence rule dropdown

**Components implemented:**

- `NotificationBell` — Polls `/api/notifications?unread=true` on a 60-second interval, shows unread badge count, and renders a dropdown of recent notifications with mark-as-read functionality
- `ItemCard` — Displays item title, due date, category, urgency badge (overdue / due soon / upcoming), and quick-complete button
- `DashboardSection` — Renders a labeled group of `ItemCard` components for each urgency tier
- `Layout` — Shared shell with navigation, notification bell, and logout

**Responsive design:**

The UI is designed to be functional across desktop and tablet viewports. Navigation collapses on smaller screens. Item cards stack vertically on narrow viewports.

---

## 3. Back-End Development

The backend is a Node.js + Express REST API written in TypeScript. All routes require JWT authentication except `/api/auth/register` and `/api/auth/login`. Input is validated by middleware before reaching controllers.

**API endpoints implemented:**

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

**Business logic implemented:**

- **Recurrence auto-creation** — When an item with a recurrence rule is marked complete, the service layer automatically creates the next occurrence using `date-fns` `addWeeks`, `addMonths`, or `addYears` based on the rule
- **Urgency classification** — Items are classified as overdue, due in 1 day, due in 3 days, or due in 7 days based on the difference between `due_date` and the current timestamp
- **Notification generation** — The notification service scans user items, generates notification records for urgency tiers, and de-duplicates to prevent repeat entries on each poll cycle
- **Dashboard summary** — A single endpoint aggregates item counts into overdue, due-soon, and upcoming buckets for the frontend dashboard widgets

**Database schema (key tables):**

- `users` — id, email, password_hash, created_at
- `items` — id, user_id, category_id, title, description, due_date, recurrence_rule, status, created_at, updated_at
- `categories` — id, user_id, name
- `tags` — id, user_id, name
- `item_tags` — item_id, tag_id (join table)
- `notifications` — id, user_id, item_id, urgency_tier, is_read, created_at

---

## 4. Functional Application

The application meets all stated goals for Milestone 2. Users can register, log in, and manage a full set of life-admin tasks through a working UI backed by a live database.

**Workflows verified as functional:**

- Register a new account and log in with JWT authentication
- Create an item with a title, description, due date, category, tags, and recurrence rule
- View all items on the Items page with active filtering and sorting
- View the Dashboard with items correctly grouped into Overdue, Due Soon, and Upcoming sections
- Edit and delete items from the ItemDetail page
- Complete a recurring item and verify that the next occurrence is automatically created
- Receive and dismiss in-app notifications for overdue and due-soon items
- Create and delete categories and tags
- Log out and verify protected routes redirect to login

**Known limitations at this milestone:**

- Pagination is not yet implemented on `GET /api/items` — all matching items are returned in a single response
- The notification service regenerates on every GET request rather than running on a scheduled interval; this will be refactored in Sprint 3
- Mobile layout has minor alignment issues on viewports narrower than 375px

---

## 5. Testing and Quality Assurance

Testing for Milestone 2 covers the backend service layer and API endpoints. Frontend component testing is planned for Milestone 3.

**Unit tests — service layer:**

- `itemService.completeItem()` — verifies status updates to completed and next recurrence is created for weekly, monthly, and yearly rules; verifies no recurrence is created when rule is null
- `notificationService.generateNotifications()` — verifies correct urgency tier assignment for overdue, due in 1 day, due in 3 days, and due in 7 days; verifies items with no due date are skipped
- `itemService.getItemById()` — verifies that items belonging to other users return null (authorization boundary)

**Integration tests — API endpoints:**

- `POST /api/auth/register` — valid input creates user and returns token; duplicate email returns 409
- `POST /api/auth/login` — correct credentials return token; wrong password returns 401
- `POST /api/items` — authenticated user creates item; unauthenticated request returns 401
- `DELETE /api/items/:id` — owner can delete; non-owner returns 404 (IDOR protection verified)
- `POST /api/items/:id/complete` — completes item and creates next occurrence for recurring items
- `GET /api/dashboard/summary` — returns correct counts for overdue, due-soon, and upcoming buckets

**Code quality practices:**

- TypeScript strict mode enabled on both client and server
- ESLint configured with recommended rules for consistent code style
- All API inputs validated through middleware before reaching controllers
- Sensitive data (passwords) hashed with bcrypt, never stored in plaintext
- JWT secrets stored in environment variables, never hardcoded

---

## 6. Documentation

**Technical documentation:**

- `README.md` — Project overview, tech stack, prerequisites, setup steps for database, backend, and frontend, API endpoint reference, and project directory structure
- `System-Architecture.md` — Full system overview, architectural decisions and rationale, database schema, API design, data flow, security considerations, and deployment notes
- `Software-QualityTesting.md` — Unit test plan covering 5 core functions, integration test plan, defect tracking process, and team testing responsibilities
- `code-review.md` — Structured peer code review of the Items CRUD feature covering correctness, architecture, readability, security, and performance with before/after refactor examples
- `milestone_2.md` — This document

**User-facing documentation:**

The `README.md` Quick Start section provides step-by-step instructions for cloning the repo, creating the database, configuring environment variables, running migrations, and starting both the backend and frontend. A new user can get a local instance running from scratch following those instructions alone.

---

## 7. Sprint Progress and Collaboration

**Sprint 1 completed (James Rhodes):**

- Backend auth routes (register, login, JWT middleware)
- User repository and bcrypt password hashing
- Notification service, controller, and API endpoints
- In-app NotificationBell frontend component

**Sprint 2 completed (Shane Stroud):**

- Items CRUD routes, controller, service, and repository
- Dashboard summary endpoint and DashboardSection component
- Categories and tags endpoints with many-to-many item_tags join table
- ItemCard, ItemForm, and ItemDetail frontend components
- Filtering and sorting on GET /api/items

**GitHub activity:**

- All features developed on separate branches and merged to `main` via pull requests
- Pull request reviews conducted and documented in `code-review.md`
- Commit history reflects individual contributions from both members

**Sprint 3 planned:**

- Refactor notification generation to a scheduled background job
- Add pagination to GET /api/items
- Frontend component testing with Vitest and React Testing Library
- Final UI polish and mobile layout fixes
- Deployment to a cloud host for the Milestone 3 demonstration

---

## 8. Reflection

**What went well:**

The three-tier architecture held up well as features were added. Because business logic lives in the service layer and data access is isolated in repositories, both members were able to work on separate features simultaneously without creating conflicts. The Knex migration system made it straightforward to add new tables and columns without breaking existing data.

**What was challenging:**

Coordinating the many-to-many tag relationship across the API, join table, and frontend form took more time than expected. The item completion and recurrence logic also required careful handling to avoid data consistency issues when multiple writes needed to be atomic.

**What we would do differently:**

We would establish pagination as a standard pattern from the beginning rather than building it in later. We would also move notification generation to a scheduled job from the start rather than embedding it in the GET handler, which created an architectural inconsistency we now need to refactor.

**How peer review improved the project:**

The structured code review conducted during Sprint 2 identified two high-severity issues a missing database transaction on item completion and an authorization gap on the DELETE and PUT endpoints that would not have been caught by TypeScript or single-user testing. Both were resolved before merging to main. The review process will be repeated for all Sprint 3 pull requests.
