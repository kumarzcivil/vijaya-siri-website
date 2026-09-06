# Vijaya Siri - Full Stack Platform

## Project Overview

**Vijaya Siri** is a comprehensive full-stack web platform for service estimation, booking, and management. The platform enables users to get quotes for various services (pro-fix and quick-fix), manage bookings, and administrators to control services, packages, and marketing offers.

The system consists of a **Node.js/Express.js backend** with MongoDB + Redis, and a **React + TypeScript + Vite frontend** with modern React patterns and comprehensive feature sets.

---

## Architecture

### High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENT-FACING LAYER                              │
│  ┌─────────────────┐  HTTPS/REST API  ┌──────────────────────────┐ │
│  │  React SPA      │  ──────────────▶ │  Express.js API Server   │ │
│  │  (Vite + TS)    │                │  (port 5000)             │ │
│  └─────────────────┘                └──────────────────────────┘ │
│          ▲                                   ▲                      │
│          │                                   │                      │
│  ┌─────────────────┐  WebSocket/Push  │                      │
│  │  Service Workers│  ──────────────▶ │  Node.js + Redis         │ │
│  └─────────────────┘                └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ MQTT/TLS
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                             │
│  ┌────────────────────┐  MongoDB Atlas  ┌────────────────────────┐ │
│  │  MongoDB           │  (SRV + TLS)   │  Redis (local/remote)  │ │
│  └────────────────────┘  └─────────────┘  └────────────────────────┘ │
│  ┌────────────────────┐                        │ Cloudinary           │ │
│  │  File Storage      │  ──────────────▶ │  Media Hosting         │ │
│  └────────────────────┘                        └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Backend Architecture (MVC Pattern)

```
backend/
├── config/           # DB, Redis, Cloudinary configuration
├── src/
│   ├── controllers/  # Route handlers with business logic
│   ├── models/       # Mongoose schemas & models
│   ├── routes/       # Express route definitions
│   ├── services/     # Business logic services
│   ├── middleware/   # Express middleware (auth, admin, validation)
│   ├── utils/        # Utility functions (cloudinary upload)
│   └── scripts/      # Utility scripts
└── server.js         # Entry point & middleware composition
```

### Frontend Architecture (Feature-Sliced Approach)

```
frontend/
├── src/
│   ├── main.tsx      # App entry point
│   ├── App.tsx       # Root component with routing
│   ├── pages/        # Page components (31 pages)
│   ├── components/   # Reusable UI components (24+ types)
│   ├── context/      # React Context (Auth, Location)
│   ├── hooks/        # Custom React hooks (13 hooks)
│   ├── api/          # API client modules (13 modules)
│   ├── store/        # Redux-like state management (8 stores)
│   ├── styles/       # Global styles + Tailwind config
│   ├── data/         # Static data fixtures (30+ files)
│   └── estimator/    # Estimator calculator modules
├── vite.config.ts    # Vite + React plugin config
├── tailwind.config.mjs
└── oxlint.config.json
```

---

## System Design Details

### 1. Database Design (MongoDB)

**Core Collections:**

| Collection | Key Fields | Purpose |
|------------|------------|---------|
| `users` | `email`, `password`, `role`, `isActive`, `profile` | Authentication & authorization |
| `addresses` | `user`, `address`, `latitude`, `longitude` | User location/addresses |
| `projects` | `user`, `title`, `description`, `status`, `estimates` | Service projects |
| `estimates` | `project`, `amount`, `status`, `createdAt` | Cost estimates |
| `packages` | `name`, `price`, `features`, `category` | Pre-defined service packages |
| `quotes` | `user`, `project`, `amount`, `expiresAt` | Formal quotes |
| `bookings` | `user`, `project`, `status`, `paymentStatus` | Service bookings |
| `notifications` | `user`, `message`, `type`, `read` | User notifications |
| `offers` | `code`, `discount`, `expiresAt`, `active` | Marketing offers |
| `push_subscriptions` | `keys.p256dh`, `keys.auth`, `user` | Push notification subscriptions |
| `site_control` | `key`, `value` | Feature flags & maintenance mode |

**Indexing Strategy:**
- Compound indexes on `(user, role)` for auth queries
- Text indexes on `projects.title`, `quotes.message` for search
- Geospatial indexes on `addresses.latitude`/`longitude` for location-based queries

### 2. Authentication & Authorization

**Flow:**
1. Client sends login credentials → `/api/auth/login`
2. Server validates → returns JWT token + user data
3. Client stores token in `localStorage`
4. Subsequent requests include `Authorization: Bearer <token>`
5. `auth` middleware verifies token, checks `isActive` flag
6. `isAdmin` middleware checks `req.user.role === 'admin'`

**JWT Configuration:**
- Secret: `vijayasiri_jwt_secret_key_2026`
- Expiration: 7 days (`7d`)
- Algorithm: HS256

**Role-Based Access:**
- `user` - Regular authenticated users
- `admin` - Administrative users with full access

### 3. Push Notification System

**Technology Stack:**
- `web-push` library for VAPID-encrypted push notifications
- `ioredis` for Redis subscription management
- VAPID keys configured in `.env`

**Flow:**
1. User consents to push notifications
2. Subscription sent to `/api/notifications/subscribe`
3. Server stores subscription in MongoDB `push_subscriptions`
4. Stale subscriptions cleaned on server startup
5. Admin triggers notification → server pushes to all active subscriptions
6. `web-push` uses VAPID keys for encryption

**VAPID Keys (in .env):**
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT=mailto:admin@vijayasiri.com`

### 4. Estimator Module

**Complex calculator for service pricing with multiple sub-modules:**

```
estimator/
├── civil-works/      # Civil engineering work estimation
├── quantity/         # Quantity take-off calculations
├── material/         # Material cost estimation
├── templates/        # Pre-configured estimation templates
├── estimator-config # Global estimator settings
└── estimator-templates # Template management
```

**Each estimator section has its own:**
- API routes (`/api/estimator/...`)
- Service routes
- UI pages
- State management

### 5. Service Booking Systems

**Pro-Fix (Professional Fix):**
- Full-service booking workflow
- Multi-step estimation → booking → confirmation
- Service selection → detail page → estimate → book visit
- Admin management of services, categories, banners

**Quick-Fix (Emergency/Quick Service):**
- Simplified booking flow
- Service selection → detail → book page → confirmation
- Admin management of quick-fix services/categories/banners

Both systems share similar patterns but differ in complexity and workflow.

### 6. Marketing & Offers System

- `offers` collection for discount codes
- `marketing` & `marketing-statistics` admin sections
- `coupons` data fixtures for promotions
- Feature-gated routes via `FeatureGate` component

### 7. File Upload & Media Handling

- **Multer** for multipart/form-data handling
- **Cloudinary** for image/video hosting and transformations
- Upload routes: `/api/upload`
- Cloudinary configuration with API credentials
- Image optimization via `sharp` library

---

## Technology Stack

### Backend
| Category | Technologies |
|----------|------------|
| Runtime | Node.js (ESM module type) |
| Framework | Express.js v5 |
| Database | MongoDB Mongoose v9 |
| Caching | Redis ioredis v5 |
| File Storage | Cloudinary v2 |
| Authentication | jsonwebtoken v9, bcrypt v5 |
| Validation | express-validator v7 |
| Security | Helmet v8, CORS |
| Push Notifications | web-push v3 |
| HTTP Client | none (native fetch/axios) |

### Frontend
| Category | Technologies |
|----------|------------|
| Language | TypeScript ~6.0 |
| Framework | React 19 + React DOM 19 |
| Build Tool | Vite ^8.2.0 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS (v4 via PostCSS) |
| Icons | Lucide React v1.41 |
| State Management | Custom hooks + Context API |
| Linting | Oxlint v1 |
| Compiler | Oxc / SWC (via Vite plugin) |

### DevOps & Infrastructure
- **Environment Variables**: `.env` files (PORT, MongoDB URI, JWT, Cloudinary, VAPID)
- **Deployment**: Ready for Render (backend) + Vercel (frontend)
- **Process Management**: `npm run dev` with `--watch` flag
- **DNS SRV Resolution**: Custom `nslookup`-based MongoDB SRV fallback

---

## API Endpoints Overview

### Authentication Routes (`/api/auth`)
- `POST /login` - User login
- `POST /signup` - User registration
- `POST /admin/login` - Admin login

### Resource Routes
| Prefix | Description |
|--------|-------------|
| `/api/addresses` | User addresses management |
| `/api/projects` | Project CRUD operations |
| `/api/packages` | Service packages listing |
| `/api/site-control` | Feature flags & maintenance mode |
| `/api/estimator/config` | Estimator global configuration |
| `/api/estimator/templates` | Estimation templates |
| `/api/estimator/estimates` | Estimate calculations |
| `/api/admin/customers` | Customer management (admin) |
| `/api/quotes` | Quote creation & management |
| `/api/admin/quotes` | Admin quote management |
| `/api/pro-fix` | Pro-fix service booking |
| `/api/quick-fix` | Quick-fix service booking |
| `/api/upload` | File upload to Cloudinary |
| `/api/marketing` | Marketing campaigns |
| `/api/offers` | Discount offers |
| `/api/bookings` | Booking management |
| `/api/notifications` | Push notification subscriptions |

### Health Check
- `GET /api/health` - `{ status: "ok", timestamp }`
- `GET /api/test-cloudinary` - Cloudinary connectivity test

---

## Setup & Installation

### Prerequisites
- Node.js >= 18.x
- MongoDB Atlas account (or local MongoDB)
- Redis instance (local or managed)
- Cloudinary account
- VAPID key pair for push notifications

### Backend Setup
```bash
cd backend
cp .env.example .env  # or use provided .env
npm install
npm run dev  # or: npm start
```

**Environment Variables (`backend/.env`):**
```
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Admin credentials
None

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# VAPID (Web Push)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@vijayasiri.com

# Push TTL
PUSH_TTL=86400
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Vite dev server
```

**Available Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run Oxlint
- `npm run preview` - Preview production build

---

## Project Conventions

### Backend Code Conventions
- All files use ES module syntax (`import/export`)
- Async/await pattern for all database operations
- Error handling with try/catch blocks
- Consistent error response format: `{ success: false, message: "..." }`
- JWT verification with specific error handling for `TokenExpiredError`
- Role-based access using `isAdmin` middleware

### Frontend Code Conventions
- TypeScript strict mode enabled
- Functional components with hooks
- Feature-gated routing via `FeatureGate` component
- Protected routes via `ProtectedRoute` and `AdminRoute` components
- Service gates via `ServiceGate` for pro-fix/quick-fix access
- Context providers: `AuthProvider` + `LocationProvider`
- API calls centralized in `src/api/` modules
- State management via custom hooks + React Context

### Routing Patterns
- Public routes: `/login`, `/signup`, `/`
- Auth-protected: `/account`, `/bookings`, `/notifications`, `/payment`
- Admin routes: `/admin/*`, `/control-center/*`
- Feature-gated: routes with `FeatureGate feature="..."`
- Service-gated: routes with `ServiceGate service="proFix"|"quickFix"`

---

## Key Features Summary

1. **User Authentication** - JWT-based with role separation
2. **Push Notifications** - VAPID-encrypted via web-push
3. **Estimator Calculator** - Multi-section pricing engine
4. **Dual Booking Systems** - Pro-fix (full) + Quick-fix (simplified)
5. **Admin Dashboard** - Comprehensive management interface
6. **Marketing Offers** - Discount codes & campaigns
7. **Location-Based Services** - Geo-aware feature selection
8. **File Upload** - Cloudinary integrated media handling
9. **Feature Flags** - `site-control` for maintenance/mode toggles
10. **Responsive Design** - Mobile-first with Tailwind CSS

---

## Deployment

### Backend (Render.com recommended)
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Build command: `npm install`
4. Start command: `npm start`
5. Service will run on port 5000

### Frontend (Vercel recommended)
1. Connect GitHub repository
2. Framework preset: Vite
3. Set environment variables if needed
4. Deploy with automatic preview deployments

### Environment Parity
Ensure `backend/.env` and frontend have matching configuration for:
- API base URLs
- Cloudinary settings
- VAPID keys for push notifications
- Redis connection details

---