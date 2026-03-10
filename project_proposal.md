# Capstone Milestone 1 — Project Proposal & Planning

**Project Title:** Personal Logistics and Life Administration Tracker  
**Repository:** https://github.com/xbazinga002/Personal-Logistics-and-Life-Administration-Tracker-  
**Team Name:** AdminOPs  
**Members:** James Rhodes,Shane Stroud 
**Date:** 2/6/2026


## 1) Problem Definition & Objectives

### Problem Statement (Real-World Need)
People manage important responsibilities—document renewals, deadlines, recurring obligations, and one-time tasks—across scattered places (notes apps, email, calendars, and memory). This fragmentation makes it easy to miss due dates or lose track of what needs handled next, especially for users with irregular schedules or limited free time. Missed deadlines can cause late fees, penalties, wasted time, and avoidable stress.

**Target Users:** Individuals managing their own responsibilities, especially those with inconsistent schedules (shift work, travel rotation, multiple jobs, school).

### Why This Problem Is Worth Solving
Most life-admin responsibilities are not difficult, they are just easy to forget. A centralized system with clear dates, status, urgency, and reminders reduces mental load and helps users stay organized.

### Measurable Objectives (Success Criteria)
By the end of the semester, the app will:
1. Provide a single dashboard showing **Overdue**, **Due Soon (next 7 days)**, and **Upcoming (next 30 days)** items.
2. Allow users to create/manage tasks in **under 30 seconds** for a typical entry (title + due date + category).
3. Support recurring tasks where completing a task automatically generates the next occurrence with **correct date calculations** (weekly/monthly/yearly).
4. Provide in-app notifications for items **due within 7/3/1 days** and for **overdue** items.
5. Pass defined test cases for recurrence logic and API endpoints with a target of **≥ 80% coverage** on core business-logic modules.

---

## 2) Scope & Feasibility

### MVP Scope (Must-Have for a Successful Capstone)
The MVP is designed to be achievable within one semester and meets required specs (full-stack + DB + meaningful business logic + DS&A).

**Core Features**
1. **Authentication & Accounts**
   - Register / Login / Logout
   - Password hashing + JWT-based sessions
   - User data isolation (each user sees only their items)

2. **Admin Items CRUD (with meaningful workflows)**
   - Create, view, update, delete admin items:
     - Fields: title, description/notes, due date, category, tags, status, recurrence rule, priority/urgency score
   - Status states: `pending`, `completed`, `overdue`, `archived`

3. **Business Logic (Beyond basic CRUD)**
   - **Urgency & Status Engine**
     - Compute urgency tiers based on days-to-due (overdue, due soon, upcoming)
     - Determine `overdue` status when due date passes (computed on query and/or via scheduled job)
   - **Recurring Task Engine**
     - Weekly / Monthly / Yearly recurrence
     - When a recurring item is marked completed, generate the next occurrence automatically
     - Prevent duplicate generation (idempotency)

4. **Dashboard + Organization**
   - Dashboard summary counts + lists: overdue, due soon (7 days), upcoming (30 days)
   - Search + filter + sort by category, tag, status, recurrence, and due date range

5. **In-App Notifications**
   - Generate notifications for due soon / overdue items
   - Notification center/list + “mark as read”

### Stretch Goals (If Time Allows)
- **Templates** for common items (e.g., “Car registration renewal”, “Rent payment”, “Passport renewal”)
- **Attachments** (upload PDF/image linked to an item; store metadata in DB)
- **Archive history** and activity log

### Out of Scope (To Protect Feasibility)
- External calendar integrations (Google/Outlook)
- Native mobile apps
- Complex recurrence rules (e.g., custom cron patterns, “third Thursday”)
- Paid third-party notification services unless needed and approved

### Feasibility Justification
This project is feasible in one semester because:
- The core is standard item tracking + predictable date-based logic.
- Recurrence and urgency can be implemented incrementally and tested thoroughly.
- No required third-party APIs reduces integration risk and scope creep.

**Key Risks + Mitigations**
- **Recurrence date correctness** → implement as a dedicated module with unit tests and edge cases.
- **File upload security** → keep optional; enforce strict file size/type rules; store only metadata.
- **Time management** → sprint-based plan with weekly deliverables and clear ownership.

---

## 3) Technology Stack Selection (with Justification)

### Front-End
- **React + TypeScript**
  - Reusable form-based UI with strong maintainability
  - Type safety reduces runtime errors
  - Great ecosystem for routing/forms/validation

Suggested libraries:
- React Router (routing)
- React Hook Form + Zod (forms + validation)

### Back-End
- **Node.js + Express (REST API)**
  - Straightforward API development
  - Middleware pattern fits auth, validation, and structured error handling

### Database
- **PostgreSQL**
  - Relational modeling supports users, items, tags, recurrence rules, and notifications
  - Indexing supports dashboard query performance and filtering

### Auth & Security
- **JWT** for stateless API authentication
- **bcrypt** for password hashing
- Input validation + authorization checks per request

### Testing Tools
- **Jest** for unit tests
- **Supertest** for API integration tests
- Optional: Playwright/Cypress for basic UI flows (stretch)

---

## 4) Architecture & Design

### Architecture Style
**Client–Server, Layered Architecture (MVC-style separation)**
- **Client (React)**: UI, forms, client-side routing
- **API (Express)**: routes/controllers, validation, auth middleware
- **Service Layer**: business logic (recurrence engine, urgency/status, notification generation)
- **Data Access Layer**: DB queries (repositories)
- **Database (PostgreSQL)**: persistent storage

### High-Level Architecture Diagram
```mermaid
flowchart LR
  FE[Frontend - React and TypeScript] --> BE[Backend - Express REST API]
  BE --> AUTH[Auth - JWT middleware]
  BE --> SVC[Service layer - business logic]
  SVC --> DAL[Data access layer]
  DAL --> DB[PostgreSQL database]
  SVC --> NOTIF[Notification generator]
  BE --> FILES[Optional file storage]


