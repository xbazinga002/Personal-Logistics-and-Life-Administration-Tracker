# Agile Planning Document
**Project:** Personal Logistics and Life Administration Tracker  
**Team:** AdminOPs  
**Members:** James Rhodes,Shane Stroud
**Date:** 02/06/2026  

---

## 1. Product Vision Statement
The Personal Logistics and Life Administration Tracker is for individuals who need a simple way to keep track of life responsibilities like renewals, deadlines, recurring obligations, and one-time tasks. It is especially helpful for people with irregular schedules (shift work, travel rotation, multiple jobs, students) who don’t always have the same routine and can’t rely on memory alone.

The product solves the problem of life-admin tasks being scattered across notes apps, calendars, emails, and mental reminders. By centralizing tasks into one place with clear due dates, statuses, and reminders, it reduces missed deadlines, late fees, stress, and wasted time. The value is peace of mind and a reliable “single source of truth” for what needs to be handled next.

---

## 2. Initial Product Backlog (12 Items)
| # | Title | Description | Priority |
|---|-------|-------------|----------|
| 1 | Repo + Project Setup | Initialize repo structure, linting/formatting, basic README, dev scripts | High |
| 2 | Database Schema v1 | Create PostgreSQL schema for users, items, categories, tags, notifications | High |
| 3 | Auth: Register/Login | Implement register + login endpoints, bcrypt hashing, JWT issuance | High |
| 4 | Auth Middleware | JWT verification middleware + route protection + user isolation | High |
| 5 | Items CRUD API | Create/read/update/delete endpoints for life-admin items | High |
| 6 | Filtering + Sorting | Query params for filtering by status/category/tag and sorting by due date | Medium |
| 7 | Dashboard Summary API | Endpoint for overdue/due soon/upcoming buckets (7/30 day windows) | High |
| 8 | Recurrence Engine v1 | Weekly/monthly/yearly recurrence; generate next occurrence on completion | High |
| 9 | Notifications v1 | Generate due soon + overdue notifications; list + mark-as-read | Medium |
|10| Frontend: Auth Screens | React pages/forms for register/login + token storage | High |
|11| Frontend: Items UI | Create/edit/list items, basic dashboard view | Medium |
|12| Testing + Docs Baseline | Jest/Supertest setup + initial tests + setup documentation | Medium |

---

## 3. User Stories (Minimum 5)
1. **As a user, I want to create an account and log in so that my tasks are private and tied to my profile.**  
2. **As a user, I want to add a life-admin item with a due date and category so that I can track what needs to be done and when.**  
3. **As a user, I want to see overdue and upcoming tasks on a dashboard so that I can quickly decide what to handle first.**  
4. **As a user, I want to mark a recurring task as complete so that the next occurrence is automatically created without manual re-entry.**  
5. **As a user, I want to filter and sort my tasks by due date, category, and status so that I can find what matters quickly.**  

(Optional extras if you want more)
6. **As a user, I want to view notifications for tasks that are due soon or overdue so that I don’t miss deadlines.**  
7. **As a user, I want to archive completed items so that my active list stays clean while keeping records.**  

---

## 4. Sprint Plan (Sprint 1)
**Sprint duration:** 2 weeks  

**Sprint goal:** Deliver a working backend foundation with authentication, database persistence, and the core items API so the team can start building UI features on top of real data.  

**Selected backlog items (Sprint 1 — 5 items):**
1. Repo + Project Setup (Backlog #1)  
2. Database Schema v1 (Backlog #2)  
3. Auth: Register/Login (Backlog #3)  
4. Auth Middleware (Backlog #4)  
5. Items CRUD API (Backlog #5)  

**Justification:**  
These are the minimum foundation blocks for everything else. Without schema + auth + protected CRUD endpoints, the frontend cannot integrate meaningfully and business logic (dashboard, recurrence, notifications) can’t be reliably implemented or tested.

---

## 5. Team Roles and Responsibilities
> Update names as needed. Roles can rotate later.

- **Scrum Master (coordination / blockers / standups):** [NAME]  
  - Keeps sprint board updated, schedules check-ins, removes blockers, ensures tasks are broken down.

- **Product Owner (priorities / scope control / acceptance):** [NAME]  
  - Owns backlog priority, clarifies requirements, approves “done” based on acceptance criteria.

- **Implementation / Development Responsibilities (shared):**
  - **Backend lead:** [NAME] — API routes, auth, services, testing  
  - **Frontend lead:** [NAME] — UI flows, forms, routing, API integration  
  - **Database/DevOps support:** [NAME] — schema, migrations, local setup, scripts/docs  
  - **QA/Testing support:** [NAME] — test plans, unit/integration tests, bug verification  



---

## 6. Reflection (Individual Paragraphs)


**James Rhodes**  
I think the hardest part of Agile for this project will be staying consistent with planning and communication while we’re all busy and working on different schedules. It’s easy to underestimate tasks or let features creep in, especially when we keep thinking of “one more thing” that would be cool to add. Agile helps reduce project failure because it forces us to build in small working chunks, get something functional early, and adjust based on what actually works instead of guessing. Regular check-ins and sprint goals also keep us from getting lost or stuck on one feature for too long. If we follow the backlog and keep priorities clear, we’ll always know what to work on next and what can wait.

Shane Stroud   
For me, I think the hardest part of Agile will be managing my time between school, work, and this project while still sticking to what we commit to in each sprint. Sometimes I feel like I can get more done than I realistically can, so staying honest about workload will be important. I like that Agile focuses on building small pieces that actually work instead of trying to finish everything at once. That lowers the chances of the whole project falling apart if something goes wrong. I also think having clear priorities will help me stay focused instead of jumping ahead to features that aren’t part of the sprint. If we communicate well and stay organized, I believe we can keep steady progress and avoid last minute stress.


---
