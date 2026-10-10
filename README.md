# Personal Consistency Tracker

A private single-user Personal Consistency Tracker built with React, Vite, Express, and PostgreSQL (Supabase). Features a spreadsheet-style monthly habit tracker with dynamic calendar columns, daily completion checkboxes, non-fabricated analytics charts, and streak calculations.

## Core Features

- **Spreadsheet-Style Monthly Tracking Grid**:
  - Full-month table view with dynamic columns (28/29/30/31 days) matching any selected month.
  - Sticky task labels for seamless horizontal scrolling on desktop and mobile.
  - Interactive daily checkboxes (□ / ✓) that update completions, analytics, and streaks in real-time.
- **Dynamic Month Navigation**:
  - Previous Month (e.g. `← September 2026`), Current Month (`October 2026`), Next Month (`November 2026 →`), and jump-to-today button.
- **No Sample Data Policy**:
  - Starts completely empty: no demo tasks, no fake completions, no fabricated charts or users.
- **Mathematical Consistency Calculations**:
  - `(Completed task-days / Expected task-days) * 100`
  - Only counts passed days from each task's `start_date`.
  - Future dates are never penalized as missed.
- **Consecutive Streak Tracking**:
  - Real-time Current Streak, All-Time Longest Streak, and Task-Specific Streaks.
  - Missed days break streaks; future dates are ignored.
- **Interactive Analytics**:
  - Doughnut chart: Completed vs. Not Completed task-days.
  - Bar chart: Task-wise consistency comparison.
  - Line chart: Daily consistency trend over time.
  - Clean empty states when no data has been logged yet.
- **Task Management**:
  - Create tasks with Name, Category, Start Date, and Description (un-prefilled).
  - Edit task metadata.
  - Deactivate tasks safely without erasing historical completion records.

---

## Architecture & Project Structure

```
├── backend/
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── calendarController.js
│   │   ├── completionController.js
│   │   └── taskController.js
│   ├── database/
│   │   ├── initDatabase.js
│   │   ├── schema.sql
│   │   └── db.js
│   ├── middleware/
│   │   ├── cors.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── calendarRoutes.js
│   │   ├── index.js
│   │   └── taskRoutes.js
│   ├── services/
│   │   ├── analyticsService.js
│   │   ├── completionService.js
│   │   └── taskService.js
│   ├── utils/
│   │   ├── consistencyCalculations.js
│   │   └── dateHelper.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── src/
│   ├── components/
│   │   ├── AddTaskModal.tsx
│   │   ├── EditTaskModal.tsx
│   │   ├── EmptyState.tsx
│   │   ├── MonthlyTrackerGrid.tsx
│   │   ├── Navbar.tsx
│   │   └── SummaryCards.tsx
│   ├── pages/
│   │   ├── AnalyticsPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── StreaksPage.tsx
│   │   └── TasksPage.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── consistencyCalculator.ts
│   │   └── dateUtils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server.ts
├── package.json
└── README.md
```

---

## Automatic Database Initialization

When the backend starts (`npm run dev`), `initDatabase.js` runs automatically:
1. Connects to PostgreSQL using `DATABASE_URL` or `SUPABASE_DB_URL`.
2. Checks whether tables exist in the `public` schema.
3. Automatically executes `backend/database/schema.sql` (`CREATE TABLE IF NOT EXISTS`).
4. Safe to run multiple times: never deletes existing tables, never drops data, never resets database, and never inserts sample records.

### Database Tables:

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    category VARCHAR(100) DEFAULT 'General',
    start_date VARCHAR(10) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_completions (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    completion_date VARCHAR(10) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_task_date UNIQUE (task_id, completion_date)
);
```

---

## Backend REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Get all tasks |
| `POST` | `/api/tasks` | Create a new task |
| `PUT` | `/api/tasks/:id` | Update task details / status |
| `DELETE` | `/api/tasks/:id` | Delete task |
| `GET` | `/api/tasks/:id/completions` | Get completions for a task |
| `PUT` | `/api/tasks/:id/completions/:date` | Toggle completion status for date |
| `GET` | `/api/calendar?month=YYYY-MM` | Get full monthly spreadsheet data |
| `GET` | `/api/analytics` | Get overall consistency & trend data |
| `GET` | `/api/analytics/tasks` | Get task-specific consistency rates |
| `GET` | `/api/analytics/monthly` | Get monthly consistency rates |
| `GET` | `/api/streaks` | Get current and longest streak metrics |
| `POST` | `/api/reset` | Clear all data (via Settings) |

---

## Development

```bash
# Install dependencies
npm install

# Start full-stack dev server (Vite + Express on Port 3000)
npm run dev
```
