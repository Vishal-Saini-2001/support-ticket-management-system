# Support Ticket Management System — Backend REST API

A modular, event-driven REST API built with **Node.js (JavaScript)**, **Express.js**, and **MongoDB / Mongoose**.

## Stack

- **Language & Runtime:** JavaScript (CommonJS) on Node.js 22+
- **Framework:** Express.js 4
- **Database:** MongoDB with Mongoose ODM
- **Authentication & Security:** JWT (`jsonwebtoken`), `bcryptjs` (bcrypt password hashing), `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize`, `joi` validation
- **Logging:** `morgan`
- **Testing & Linting:** Jest, Supertest, `mongodb-memory-server`, ESLint 9
- **Containerization:** Dockerfile + Docker Compose (API + MongoDB)

---

## Project Architecture

```text
backend/
├── scripts/
│   └── seed.js                 # Idempotent admin user seed script
├── src/
│   ├── config/
│   │   ├── db.js               # Mongoose connect/disconnect helpers
│   │   └── env.js              # Environment loading and validation
│   ├── controllers/            # Thin HTTP request/response handlers
│   ├── events/
│   │   ├── eventBus.js         # Central Node EventEmitter instance
│   │   ├── events.js           # Canonical event name constants
│   │   └── listeners/
│   │       ├── index.js        # Registers all listeners once
│   │       ├── activityListener.js
│   │       └── notificationListener.js
│   ├── middlewares/            # auth, authorize, validate, rateLimiter, notFound, errorHandler
│   ├── models/                 # User, Ticket, Comment, ActivityLog, Notification
│   ├── routes/                 # Modular Express routers mounted under /api
│   ├── services/               # Core business logic & event emission
│   ├── utils/                  # ApiError, asyncHandler
│   ├── validators/             # Joi schemas for params, query, and body
│   ├── app.js                  # Express app setup & middleware pipeline
│   └── server.js               # DB connection, HTTP server & graceful shutdown
├── postman/
│   └── Support-Ticket-Management.postman_collection.json
├── tests/                      # Jest + Supertest integration test suite
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── eslint.config.js
```

### Layering Rules
- **Routes** wire middleware (`auth`, `authorize`, `validate`, `authRateLimiter`) to controllers.
- **Controllers** stay thin: they extract validated inputs and delegate to services, returning JSON responses.
- **Services** enforce business rules (ownership, `open`-only edit/delete, `resolvedAt` timestamps), talk to Mongoose models, and emit domain events.
- **Listeners** subscribe to `eventBus` independently of HTTP controllers and catch/log errors so listener failures never crash API requests.

---

## Setup & Running Each Stage

### Stage 1: Install Dependencies & Configure Environment
```bash
cd backend
npm install
cp .env.example .env   # On Windows PowerShell: Copy-Item .env.example .env
```
Update `.env` (especially `JWT_SECRET`, `MONGO_URI`, and `FRONTEND_URL`).

### Stage 2: Start MongoDB (Local or Docker)
Using Docker Compose for MongoDB + API:
```bash
docker compose up --build -d
```
Or run only MongoDB via Docker while running Node locally:
```bash
docker compose up -d mongo
```

### Stage 3: Seed the Admin User
```bash
npm run seed
```
If running inside Docker Compose:
```bash
docker compose exec app npm run seed
```

### Stage 4: Run the API Server
Development mode (auto-reload via `nodemon`):
```bash
npm run dev
```
Production mode:
```bash
npm start
```
Health check: `GET http://localhost:5000/health`

### Stage 5: Lint & Run Tests
```bash
npm run lint
npm test
```
Tests run against an isolated in-memory MongoDB (`mongodb-memory-server`) so your local database is untouched.

### Stage 6: Test with Postman
Import `postman/Support-Ticket-Management.postman_collection.json` into Postman, log in via **Auth -> Login User** or **Login Admin**, and set `token` / `adminToken` collection variables.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | `development`, `production`, or `test` | `development` |
| `PORT` | HTTP server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/support_tickets` |
| `JWT_SECRET` | Secret used to sign/verify JWTs (required outside `test`) | — |
| `JWT_EXPIRES_IN` | JWT lifetime (e.g. `7d`, `12h`) | `7d` |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated | `http://localhost:3000` |
| `AUTH_RATE_LIMIT_WINDOW_MS` | Auth rate-limiter window in ms | `900000` (15 min) |
| `AUTH_RATE_LIMIT_MAX` | Max auth requests per IP per window | `20` |
| `ADMIN_NAME` | Seeded admin display name | `System Admin` |
| `ADMIN_EMAIL` | Seeded admin email | `admin@support.local` |
| `ADMIN_PASSWORD` | Seeded admin password | `Admin@123456` |

---

## Database Design

- **User**: `name`, `email` (unique + indexed), `password` (bcrypt-hashed via pre-save hook, `select: false`), `role` (`user | admin`, default `user`), `timestamps`.
- **Ticket**: `title`, `description`, `category`, `priority` (`low | medium | high | urgent`), `status` (`open | in-progress | resolved | closed`), `createdBy` (ref `User`), `resolvedAt`, `timestamps`.
  - Indexes on `createdBy`, `status`, `priority` for filtered queries and stats aggregation.
  - Compound text index on `{ title: 'text', description: 'text' }` for `?search=` queries.
- **Comment**: `ticket` (ref `Ticket`, indexed), `author` (ref `User`), `message`, `timestamps`. Cascaded delete when a ticket is deleted.
- **ActivityLog**: `ticket` (ref `Ticket`, indexed), `actor` (ref `User`), `action` (`TICKET_CREATED | TICKET_UPDATED | STATUS_CHANGED | COMMENT_ADDED | TICKET_RESOLVED`), `meta` (old/new values or comment ID), `timestamps`.
- **Notification**: `recipient` (ref `User`, indexed), `ticket` (ref `Ticket`), `type`, `message`, `isRead` (default `false`), `timestamps`. Compound index on `{ recipient: 1, createdAt: -1 }`.

---

## Event-Driven Workflow

Services emit domain events onto `src/events/eventBus.js`:

| Event | Emitted By | ActivityLog Listener | Notification Listener |
|---|---|---|---|
| `ticket.created` | `ticketService.createTicket` | Writes `TICKET_CREATED` | Notifies all `admin` users |
| `ticket.updated` | `ticketService.updateTicket` / `updateTicketPriority` | Writes `TICKET_UPDATED` (`meta.old`, `meta.new`) | — |
| `ticket.statusChanged` | `ticketService.updateTicketStatus` | Writes `STATUS_CHANGED` | Notifies ticket owner when changed by an admin |
| `ticket.resolved` | `ticketService.updateTicketStatus` (when `status === 'resolved'`) | Writes `TICKET_RESOLVED` (`resolvedAt`) | Handled cleanly alongside status change (no duplicate alert) |
| `comment.added` | `commentService.addComment` | Writes `COMMENT_ADDED` | Admin comment notifies ticket owner; user comment notifies all admins |

---

## API Endpoints Summary

- `POST /api/auth/register` — Register as `user` (ignores any `role` field in body)
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Current authenticated user profile
- `POST /api/auth/logout` — Revoke the current JWT until its expiration
- `GET /api/tickets?status=&priority=&category=&search=&sort=&page=&limit=` — Paginated ticket list (`{ data, total, page, pages }`)
- `POST /api/tickets` — Create ticket
- `GET /api/tickets/:id` — Get ticket (owner or admin)
- `PUT /api/tickets/:id` — Update ticket (owner while `open`, or admin)
- `DELETE /api/tickets/:id` — Delete ticket & its comments (owner while `open`, or admin)
- `PATCH /api/tickets/:id/status` — Update status (`admin` only; sets `resolvedAt` when `resolved`)
- `PATCH /api/tickets/:id/priority` — Update priority (`admin` only)
- `GET /api/tickets/:id/comments` — List ticket comments (owner or admin)
- `POST /api/tickets/:id/comments` — Add comment (owner or admin)
- `GET /api/tickets/:id/activity` — Get ticket activity log (owner or admin)
- `GET /api/stats` — Ticket counts by status and priority (user: own; admin: global)
- `GET /api/notifications` — List current user's notifications
- `PATCH /api/notifications/:id/read` — Mark own notification as read

---

## Key Design Decisions

1. **JavaScript (CommonJS) + Express 4**: Ensures seamless compatibility with `express-mongo-sanitize`, Jest, Supertest, and `helmet` without experimental ESM/loader flags.
2. **Joi Validation with `stripUnknown: true`**: Protects against mass assignment (e.g., ignoring `role` during registration or `status` on `PUT /api/tickets/:id`) and returns uniform `{ message, errors }` 400 responses.
3. **403 vs 404 on Ownership Checks**: Missing IDs return `404`; existing tickets owned by another user return `403` to distinguish missing resources from unauthorized access.
4. **Decoupled Async Listeners**: Event listeners catch and log all DB errors internally so notification or audit failures never break core ticket operations.
