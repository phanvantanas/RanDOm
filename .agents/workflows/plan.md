# Implementation Plan: Multi-Category Random Wheel Spinner (Prisma + Neon)

## Overview
We are building a Next.js 16+ application with TypeScript and Vanilla CSS scoped modules. The app will feature an interactive Canvas-based wheel selector supporting multiple categories (e.g. food, drinks, locations) powered by a serverless Neon PostgreSQL database via Prisma ORM.

## Architecture Decisions
- **Prisma + Neon Integration**: Prisma client configured with the serverless Neon driver allows fast database query cycles. We will manage schemas, relationships, and queries using Prisma.
- **Dynamic Category Selection**: The wheel is redrawable in real-time, matching the categories and items fetched from the database API.
- **Synthesized Audio Ticks**: The tick sound is synthesized dynamically using the Web Audio API to guarantee asset independence.
- **Fallback State**: If `DATABASE_URL` is not provided or connection fails, the app will fallback gracefully to a mock local memory dataset so it remains testable/runnable.

---

## Task List

### Phase 1: Setup & Database Foundation
#### Task 1: Environment & Dependency Installation
- **Description:** Install Prisma, `@neondatabase/serverless`, `@prisma/client`, `lucide-react`, `canvas-confetti`, and dev dependencies. Set up initial config.
- **Acceptance criteria:**
  - npm dependencies installed and recorded in `package.json`.
  - Prisma client structure initialized.
- **Verification:**
  - `npx prisma --version` runs without error.
- **Dependencies:** None
- **Files likely touched:**
  - `package.json`
- **Estimated scope:** Small

#### Task 2: Prisma Schema & Database Client Setup
- **Description:** Define the `Category`, `Item`, and `SpinHistory` tables in `prisma/schema.prisma`. Set up `src/lib/prisma.ts` for clean client reuse.
- **Acceptance criteria:**
  - `schema.prisma` contains Category, Item, and SpinHistory models with cascading deletes on Category.
  - `src/lib/prisma.ts` exports a single Prisma client instance.
- **Verification:**
  - Schema is valid: `npx prisma validate`
- **Dependencies:** Task 1
- **Files likely touched:**
  - `prisma/schema.prisma`
  - `src/lib/prisma.ts`
- **Estimated scope:** Small

#### Task 3: Database Seeding & Mock Data Fallback
- **Description:** Create a seed script in `prisma/seed.ts` to populate the database with default Categories (Food, Drinks, Locations) and Items. Define static fallback arrays in case database is down.
- **Acceptance criteria:**
  - Seeding populates default lists.
  - If database connection fails during app execution, API endpoints recover by returning hardcoded local defaults.
- **Verification:**
  - Running seed executes without throwing unhandled exceptions.
- **Dependencies:** Task 2
- **Files likely touched:**
  - `prisma/seed.ts`
  - `src/lib/defaults.ts`
- **Estimated scope:** Small

### Checkpoint 1: Database Setup Complete
- [ ] Database client and schemas verified.
- [ ] Fallback dataset configured for offline testing.

---

### Phase 2: API Endpoints Development
#### Task 4: Categories API (`/api/categories`)
- **Description:** Create the Next.js API route to fetch categories with their items (`GET`), add new categories (`POST`), and delete them (`DELETE /api/categories/[id]`).
- **Acceptance criteria:**
  - `GET /api/categories` returns a JSON list of categories with nested items.
  - `POST` creates a category.
  - `DELETE` deletes a category.
- **Verification:**
  - Endpoint returns correct structure when called via fetch or curl.
- **Dependencies:** Task 2
- **Files likely touched:**
  - `src/app/api/categories/route.ts`
  - `src/app/api/categories/[id]/route.ts`
- **Estimated scope:** Medium

#### Task 5: Items and History API (`/api/items` & `/api/history`)
- **Description:** Create API routes to add items (`POST /api/items`), delete items (`DELETE /api/items/[id]`), fetch history (`GET /api/history`), and log spins (`POST /api/history`).
- **Acceptance criteria:**
  - Endpoints update items and store spin history successfully.
- **Verification:**
  - Executing client request logs data in the database.
- **Dependencies:** Task 4
- **Files likely touched:**
  - `src/app/api/items/route.ts`
  - `src/app/api/items/[id]/route.ts`
  - `src/app/api/history/route.ts`
- **Estimated scope:** Medium

### Checkpoint 2: API Functional
- [ ] All API routes compile and return JSON.
- [ ] API routes connect and read/write to database.

---

### Phase 3: Audio & Interactive Wheel
#### Task 6: Sound Synthesizer (`SoundManager.ts`)
- **Description:** Synthesize ticking and success sounds using the browser's Web Audio API.
- **Acceptance criteria:**
  - Class `SoundManager` exports `playTick()` and `playCelebration()`.
- **Verification:**
  - Code compiles without TypeScript errors.
- **Dependencies:** None
- **Files likely touched:**
  - `src/components/SoundManager.ts`
- **Estimated scope:** Small

#### Task 7: Canvas Wheel Drawing & Physics
- **Description:** Draw dynamic wheel segments, center pins, pointers, and item text on a high-DPI canvas. Implement deceleration rotation physics using `requestAnimationFrame`.
- **Acceptance criteria:**
  - Canvas updates segments automatically when the active category changes.
  - Rotation uses angular velocity decel, selecting the exact winning segment matching math.
- **Verification:**
  - Spin animations run smoothly at 60fps and stop at the designated item.
- **Dependencies:** Task 3, Task 6
- **Files likely touched:**
  - `src/components/WheelSpinner.tsx`
  - `src/components/WheelSpinner.module.css`
- **Estimated scope:** Medium

#### Task 8: Audio & Visual Polish
- **Description:** Trigger click sound ticks on crossing segment boundaries, and fire canvas-confetti on stop.
- **Acceptance criteria:**
  - Sound ticking follows physical motion frequency.
  - Confetti pops up on landing.
- **Verification:**
  - Ticking sound plays correctly during spin; confetti pops on completion.
- **Dependencies:** Task 7
- **Files likely touched:**
  - `src/components/WheelSpinner.tsx`
  - `src/components/WheelSpinner.module.css`
- **Estimated scope:** Small

### Checkpoint 3: Interactive Spinner Complete
- [ ] Spinner rotates smoothly, plays ticks, and celebrates at the finish line.

---

### Phase 4: UI Panels, Integration & Assembly
#### Task 9: Category Selector and Options Manager
- **Description:** Create selector tabs to switch active categories and options manager panel to manage items.
- **Acceptance criteria:**
  - UI tabs update active category state.
  - Form allows adding/deleting items inside the active category, calling backend APIs.
- **Verification:**
  - Adding/deleting an item alters the wheel segments instantly.
- **Dependencies:** Task 5, Task 7
- **Files likely touched:**
  - `src/components/CategorySelector.tsx`
  - `src/components/OptionsManager.tsx`
- **Estimated scope:** Medium

#### Task 10: History Log & Layout Assembly
- **Description:** Render spin history panel and lay out all components in a responsive, glassmorphic dark-theme dashboard.
- **Acceptance criteria:**
  - History log lists the results and allows clearing them.
  - Responsive grid layouts for desktop and mobile viewport sizes.
- **Verification:**
  - App builds successfully (`npm run build`).
  - E2E flow behaves perfectly.
- **Dependencies:** Task 9
- **Files likely touched:**
  - `src/app/page.tsx`
  - `src/app/page.module.css`
- **Estimated scope:** Medium

---

## Risks and Mitigations
| Risk | Impact | Mitigation |
|:---|:---:|:---|
| **Neon Connection Latency** | High | Load categories and items initially and cache them in local state. Show loading spinners during write operations. |
| **No Database URL Provided** | Medium | Check if `DATABASE_URL` is present; if not, print a warning in console and fall back to local `localStorage` + mock arrays. |
| **Web Audio Autoplay Restrictions** | High | Delay AudioContext instantiation until the user clicks the Spin button. |
