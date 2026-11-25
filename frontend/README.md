# Helpdesk — Support Ticket Management Frontend

Notion-inspired support ticket workspace built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, **Radix UI**, **React Query**, **react-hook-form + Zod**, and **Recharts**.

---

## Setup & Running

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local   # On Windows PowerShell: Copy-Item .env.example .env.local
   ```
   Set `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`) and ensure the backend `FRONTEND_URL` matches `http://localhost:3000`.

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Typecheck, lint, and production build:**
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   npm start
   ```

---

## Keyboard Shortcuts

- `C` (outside text inputs, for user accounts): Open the **New Ticket** form immediately.
- `Esc`: Close open dialogs or mobile navigation drawer.

---

## Architecture & Routes

- **Auth (`src/app/(auth)/`):** `/login`, `/register` (JWT stored in `localStorage` via `AuthProvider`, Axios request/response interceptors in `src/lib/api.ts`).
- **User Workspace (`src/app/(app)/`):** `/dashboard`, `/tickets` (URL-synced search, filters, sort, pagination), `/tickets/new`, `/tickets/[id]`, `/tickets/[id]/edit`.
- **Admin Workspace (`src/app/(app)/admin/`):** `/admin/dashboard` (Recharts status donut + priority bar charts), `/admin/tickets`, `/admin/tickets/[id]` (inline status & priority controls).
- **Notifications:** Top-bar bell (`src/components/notifications/NotificationsBell.tsx`) polls `GET /notifications` every 30s and marks items read on click.
- **Theme Tokens:** Light & dark Notion-style palettes defined as CSS variables in `src/app/globals.css` and mapped in `tailwind.config.ts`.

