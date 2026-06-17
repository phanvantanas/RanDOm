# Product Requirements Document (PRD): Multi-Category Random Wheel Spinner

## Objective
We are building a responsive, premium web application that allows users to spin a fortune wheel to make random decisions across different categories, specifically food (thức ăn), drinks (đồ uống), locations (địa điểm), and custom user-created categories.
- **User Story**: As a user, I want to choose a category (e.g., "Food"), view a colorful wheel loaded with choices (e.g., Pho, Banh Mi, Sushi), spin it, hear ticks and celebration sounds, and see the winning choice recorded in a history panel. I also want to add/edit/delete my own options and categories, which should persist in a cloud database.
- **Key Features**:
  - **Multi-Category Support**: Dropdown or tab selection to switch between categories (Food, Drinks, Locations, Custom).
  - **Dynamic Management**: Create, update, and delete categories and their wheel items.
  - **Neon PostgreSQL Integration**: Store all categories, items, and spin history in a Neon database using Prisma ORM.
  - **HTML5 Canvas Wheel**: Dynamic segment division and text wrapping with smooth deceleration spinning physics.
  - **Audio feedback**: Web Audio API tick sounds and success fanfare.
  - **Confetti Celebration**: Visual feedback upon wheel stopping.
  - **Spin History Log**: Displays past results showing the chosen option and category, synced to the database.
  - **Premium Dark Theme**: Glassmorphic panels, glowing neon highlights, and smooth hover micro-animations.

## Tech Stack
- **Framework**: Next.js 16.x (App Router)
- **Language**: TypeScript
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Prisma ORM
- **Styling**: Vanilla CSS (CSS Modules)
- **Icons**: `lucide-react`
- **Libraries**: `canvas-confetti` (for celebration effects), `@neondatabase/serverless` (Neon driver)

## Database Schema (Prisma)
We will define three tables: `Category`, `Item`, and `SpinHistory`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Category {
  id        String   @id @default(uuid())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  items     Item[]
}

model Item {
  id         String   @id @default(uuid())
  name       String
  color      String   // Hex or HSL color code for the wheel segment
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model SpinHistory {
  id           String   @id @default(uuid())
  itemName     String
  categoryName String
  spunAt       DateTime @default(now())
}
```

## API Endpoints
- **Categories**:
  - `GET /api/categories` - Fetch all categories and their items.
  - `POST /api/categories` - Add a new category.
  - `DELETE /api/categories/[id]` - Delete a category (and its items).
- **Items**:
  - `POST /api/items` - Add a new item to a specific category.
  - `DELETE /api/items/[id]` - Delete an item.
- **History**:
  - `GET /api/history` - Fetch recent 20 spin history items.
  - `POST /api/history` - Log a new spin result.

## Commands
- **Install Dependencies**: `npm install lucide-react canvas-confetti @neondatabase/serverless @prisma/client`
- **Install Dev Dependencies**: `npm install -D prisma @types/canvas-confetti`
- **Initialize Prisma**: `npx prisma init`
- **Push Database Schema**: `npx prisma db push` (or `npx prisma migrate dev` for migrations)
- **Generate Prisma Client**: `npx prisma generate`
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── categories/       # API: GET, POST
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts # API: DELETE
│   │   ├── items/            # API: POST
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts # API: DELETE
│   │   └── history/          # API: GET, POST
│   │       └── route.ts
│   ├── page.tsx              # Main Page
│   ├── layout.tsx            # Global Layout
│   └── globals.css           # Global Theme Styles
├── components/
│   ├── WheelSpinner.tsx      # Canvas Fortune Wheel
│   ├── CategorySelector.tsx  # Tabs/Dropdown to change category
│   ├── OptionsManager.tsx    # Management form for active items
│   ├── HistoryLog.tsx        # DB-synced history panel
│   └── SoundManager.ts       # Synthesized Audio
├── lib/
│   └── prisma.ts             # Prisma Client instance
└── prisma/
    └── schema.prisma         # Database models
```

## Code Style
Standard functional React component style, typed strictly with TypeScript, and interacting with the database through API endpoints:

```typescript
// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { items: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
```

## Testing Strategy
- **Framework**: Jest + React Testing Library.
- **Endpoints**: Mock Prisma Client to test API route responses.
- **Components**: Verify render, category switching, item adding/deleting, and canvas resizing behavior.

## Boundaries
- **Always**:
  - Check database connection health gracefully (fall back to localStorage or local state if Neon database is unreachable).
  - Cleanly dispose of Web Audio API contexts and event listeners.
  - Scale Canvas based on device pixel ratio.
- **Ask first**:
  - Adding packages other than lucide, canvas-confetti, and prisma/neon.
- **Never**:
  - Commit database passwords or connection URLs (store in `.env`).
  - Perform raw SQL queries without sanitization (always use Prisma Client).

## Success Criteria
- [ ] Next.js 16+ application runs, compiles, and builds with zero errors.
- [ ] Database schema is pushed to Neon and tables are generated.
- [ ] Active category selection updates the items on the wheel instantly.
- [ ] Spin actions trigger Web Audio ticking sounds, land on the correct calculated item, show confetti, and write to database history.
- [ ] Adding, editing, or deleting items/categories updates Neon in real-time.
- [ ] UI is fully responsive and utilizes rich glassmorphism dark-theme styling.
