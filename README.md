# 📋 Mini Task Tracker

A full-stack **Task Tracker Web Application** built with modern technologies. Create, view, manage, and filter tasks with real-time updates, Redis caching, and JWT authentication.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-green)
![Redis](https://img.shields.io/badge/Redis-7+-red)

## 📂 Project Structure

```
task-tracker/
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/           # App config, DB & Redis connections
│   │   ├── controllers/      # Route handlers (thin layer)
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── models/           # Mongoose schemas (User, Task)
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # JWT helpers, response formatters
│   │   ├── validators/       # Zod validation schemas
│   │   ├── __tests__/        # Jest unit & integration tests
│   │   ├── app.ts            # Express app setup
│   │   └── server.ts         # Server entry point
│   ├── jest.config.ts
│   ├── tsconfig.json
│   └── package.json
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React context (Auth)
│   │   ├── lib/              # API client & service functions
│   │   ├── pages/            # Next.js pages
│   │   ├── styles/           # CSS modules
│   │   └── types/            # TypeScript type definitions
│   └── package.json
├── .env.example              # Environment variable template
├── package.json              # Root monorepo config
└── README.md
```

## 🏗️ Architecture

### Design Principles

- **Layered Architecture**: Controllers → Services → Models (clean separation of concerns)
- **Reusable Components**: Single `AuthForm` for login/signup, single `TaskModal` for create/edit
- **Centralized Error Handling**: `AppError` class + global error middleware
- **Standardized Responses**: All API responses use `{ success, message, data }` format
- **Validation Layer**: Zod schemas validate all inputs before they reach controllers
- **Type Safety**: Full TypeScript across backend and frontend

### Backend API Endpoints

| Method | Endpoint           | Description             | Auth Required |
| ------ | ------------------ | ----------------------- | :-----------: |
| POST   | `/api/auth/signup` | Create new user         |      ❌       |
| POST   | `/api/auth/login`  | Authenticate user (JWT) |      ❌       |
| GET    | `/api/tasks`       | List user's tasks       |      ✅       |
| POST   | `/api/tasks`       | Create a new task       |      ✅       |
| PUT    | `/api/tasks/:id`   | Update a task           |      ✅       |
| DELETE | `/api/tasks/:id`   | Delete a task           |      ✅       |

### Query Parameters (GET /api/tasks)

| Param  | Values                          | Default     |
| ------ | ------------------------------- | ----------- |
| status | `pending`, `completed`          | all         |
| sortBy | `dueDate`, `createdAt`, `title` | `createdAt` |
| order  | `asc`, `desc`                   | `desc`      |
| from   | `YYYY-MM-DD` (Date Range Start) | -           |
| to     | `YYYY-MM-DD` (Date Range End)   | -           |

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** >= 18
- **MongoDB** >= 6 (local or Atlas)
- **Redis** >= 6 (local or cloud)

### 1. Clone the repository

```bash
git clone https://github.com/sid-1974/monorepo-wlld.git
cd monorepo-wlld
```

### 2. Set up environment variables

```bash
# Copy the example env files
cp .env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://your-mongodb-uri
REDIS_URL=redis://your-redis-url
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Install all dependencies

```bash
# Install root + backend + frontend dependencies
npm run install:all
```

Or manually:

```bash
npm install                   # Root dependencies
cd backend && npm install     # Backend dependencies
cd ../frontend && npm install # Frontend dependencies
```

### 4. Start the development servers

```bash
# From root directory - starts both backend & frontend concurrently
npm run dev
```

## 🧪 Testing

### Run tests

```bash
# Run all backend tests
npm test

# Run with coverage report
npm run test:coverage
```

### Coverage: **98%+**

The test suite includes:

- ✅ Auth API tests (signup, login, validation, duplicates)
- ✅ Task CRUD tests (create, read, update, delete)
- ✅ Date-wise filtering tests
- ✅ Redis caching & invalidation tests
- ✅ Centralized Error Handling tests
- ✅ Mongoose Model & Middleware tests

## 🔑 Key Features

### Backend

- **JWT Authentication**: Secure token-based auth with `bcryptjs`.
- **Redis Caching**: Optimized performance for task listing.
- **Date Filtering**: Advanced `from`/`to` date-wise task lookups.
- **Zod Validation**: Strict schema validation for all inputs.
- **Error Handling**: Custom `AppError` and global middleware.

### Frontend

- **Optimistic UI**: Instant deletions and status toggles.
- **Date Filter UI**: Clean dashboard interface to filter tasks by date range.
- **Premium Design**: Dark mode with animated gradients and micro-interactions.
- **Stats Dashboard**: Real-time counter for pending and completed tasks.

## 📐 Database Schema

### User

| Field     | Type   | Constraints                   |
| --------- | ------ | ----------------------------- |
| name      | String | required, 2-50 chars          |
| email     | String | required, unique, validated   |
| password  | String | required, min 6 chars, hashed |
| createdAt | Date   | auto-generated                |

### Task

| Field       | Type     | Constraints              |
| ----------- | -------- | ------------------------ |
| title       | String   | required, 1-200 chars    |
| description | String   | optional, max 2000 chars |
| status      | String   | enum: pending, completed |
| dueDate     | Date     | required                 |
| owner       | ObjectId | ref: User, required      |
| createdAt   | Date     | auto-generated           |

---

## 🛠️ Scripts

| Script                  | Description                    |
| ----------------------- | ------------------------------ |
| `npm run dev`           | Start both backend & frontend  |
| `npm run backend:build` | Build backend TypeScript       |
| `npm test`              | Run backend tests              |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run install:all`   | Install all dependencies       |

## 📝 License

MIT
