# Requirements Analysis
**Project:** Personal Logistics and Life Administration Tracker  
**Team:** AdminOPs  
**Members:** James Rhodes,Shane Stroud
**Date:** 02/06/2026

---

## 1. Problem to Be Solved
Individuals manage important life responsibilities (document renewals, deadlines, recurring obligations, and one-time tasks) across scattered tools such as notes apps, email inboxes, calendars, and memory. This fragmentation increases the likelihood of missed due dates and forgotten renewals, especially for users with irregular schedules or limited free time. Missing deadlines can result in late fees, penalties, wasted time, and avoidable stress.

---

## 2. Stakeholders and Users
### Primary Users
- Individuals managing personal responsibilities and deadlines.
- Users with inconsistent schedules (shift work, travel rotation, multiple jobs, students).

### Stakeholders
- Project team (design, implementation, testing, documentation).
- Instructor (evaluation, milestone grading).

---

## 3. Scope and Constraints
### In-Scope (MVP)
- Account creation and authentication.
- CRUD for life-admin items (tasks, renewals, obligations).
- Dashboard that groups items by time sensitivity (overdue, due soon, upcoming).
- Recurrence support (weekly, monthly, yearly) with automatic next-occurrence generation.
- In-app notifications for due soon and overdue items.
- Persistent storage using PostgreSQL.

### Out of Scope (for MVP)
- External calendar integrations (Google/Outlook).
- Native mobile apps.
- Complex recurrence rules (e.g., “third Thursday”, custom cron expressions).
- Paid SMS/email reminder services (unless explicitly approved and time allows).

### Constraints
- Must be full-stack (front-end + back-end) with a database.
- Must include meaningful business logic beyond basic CRUD.
- Must demonstrate DS&A concepts from CS core.
- Must show collaboration via GitHub commits and PRs.

---

## 4. Assumptions
- Users have consistent internet access when using the app.
- Notifications are in-app (not SMS/email) for MVP.
- Recurrence generates the *next* occurrence only when a recurring item is marked complete.
- Attachments are optional and may be deferred as a stretch goal.

---

## 5. Functional Requirements (FR)
**FR-1 User Registration**
- The system shall allow a user to create an account using email and password.

**FR-2 User Authentication**
- The system shall allow users to log in and receive an authentication token (JWT).
- The system shall restrict access to authenticated users for protected routes.

**FR-3 User Data Isolation**
- The system shall ensure users can only access and modify their own items, categories, tags, and notifications.

**FR-4 Create Admin Item**
- The system shall allow users to create an item with:
  - title (required), due date (required)
  - notes (optional)
  - category (optional)
  - tags (optional)
  - recurrence rule (none/weekly/monthly/yearly)
  - status (default: pending)

**FR-5 View Admin Items**
- The system shall allow users to view a list of their items and open an item detail view.

**FR-6 Update Admin Item**
- The system shall allow users to update item fields (title, due date, notes, category, tags, recurrence, status).

**FR-7 Delete Admin Item**
- The system shall allow users to delete an item.

**FR-8 Status and Overdue Handling**
- The system shall identify items as overdue when the due date has passed and status is not completed/archived.

**FR-9 Dashboard Summary**
- The system shall provide a dashboard showing:
  - Overdue items
  - Due soon items (next 7 days)
  - Upcoming items (next 30 days)

**FR-10 Filtering and Sorting**
- The system shall allow users to search, filter, and sort items by:
  - category, tag, status, due date range, recurrence, due date order

**FR-11 Recurring Tasks**
- The system shall support weekly/monthly/yearly recurrence.
- When a recurring item is marked completed, the system shall generate the next occurrence based on the recurrence rule.
- The system shall prevent duplicate next-occurrence generation for the same completion action.

**FR-12 Notifications**
- The system shall generate in-app notifications for:
  - items due soon (configurable thresholds such as 7/3/1 days)
  - overdue items
- The system shall allow users to mark notifications as read.

**FR-13 Categories and Tags**
- The system shall allow users to create and manage categories and tags.
- The system shall allow many-to-many tagging for items.

---

## 6. Non-Functional Requirements (NFR)
**NFR-1 Security**
- Passwords shall be hashed (bcrypt).
- JWT tokens shall be required for protected endpoints.
- The system shall validate and sanitize inputs to reduce injection risks.

**NFR-2 Performance**
- Dashboard queries should return results in under 2 seconds under normal class-level usage.
- The database should use indexes for common filters (user_id, due_date, status).

**NFR-3 Reliability**
- The system shall persist data in PostgreSQL and maintain consistent item status calculations.

**NFR-4 Maintainability**
- The system shall follow a layered architecture (controllers, services, data access).
- Code style shall be consistent (linting/formatting).

**NFR-5 Usability**
- The UI shall present a clear dashboard-first experience.
- Creating a typical item should be achievable in under ~30 seconds.

**NFR-6 Testability**
- Core business logic (recurrence, urgency/status, notifications) shall be unit tested.
- Key API flows shall have integration tests.

---

## 7. Data Requirements
- Users: credentials and account metadata.
- Items: due dates, recurrence rules, status, categories/tags.
- Notifications: due-soon and overdue reminders with read/unread state.
- Optional: attachments metadata (filename, mime type, size, storage path).

---

## 8. Success Criteria (Acceptance)
The project will be considered successful if:
1. A user can register/login and see only their own data.
2. A user can create/update/delete items and view them on the dashboard.
3. Overdue/due soon/upcoming dashboard groups are correct by date logic.
4. Completing a recurring item reliably generates the next occurrence without duplicates.
5. In-app notifications are generated and can be marked read.
6. Core business logic meets a target of ≥ 80% coverage on tested modules (recurrence + notification logic).
7. GitHub history shows meaningful contributions from each member.

---

## 9. Risks and Mitigations
- Recurrence edge cases (month lengths/leap years)  
  - Mitigation: dedicated recurrence module + unit tests for edge cases.
- Scope creep (too many features)  
  - Mitigation: strict MVP first; stretch goals only if ahead of schedule.
- Security issues (auth and data access)  
  - Mitigation: middleware authorization checks + input validation + least-privilege routes.
