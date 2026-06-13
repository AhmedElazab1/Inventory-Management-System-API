# 🏪 Inventory Management System

A full-stack inventory management system built for a clothing store. It handles product management, stock tracking, sales, and reporting — with role-based access control for owners and cashiers.

> **Note:** The backend was built independently as a learning project. The frontend was built with the assistance of AI (Claude by Anthropic).

---

## ✨ Features

- 🔐 **Authentication** — JWT-based auth with refresh token rotation and httpOnly cookies
- 👥 **User Management** — Owner can create and manage cashier accounts
- 📁 **Categories** — Organize products into categories
- 👕 **Products** — Full product management with size variants (S/M/L/XL)
- 📦 **Inventory** — Track stock movements (in, out, adjustments) with full audit trail
- 🧾 **Sales** — Cashier POS with automatic stock deduction
- 📊 **Reports** — Revenue, profit, top products, low stock alerts, and cashier performance

---

## 🛠️ Tech Stack

### Backend

| Technology           | Purpose                 |
| -------------------- | ----------------------- |
| Node.js + TypeScript | Runtime & language      |
| Express 5            | Web framework           |
| Prisma 7             | ORM                     |
| PostgreSQL           | Database                |
| Zod 4                | Validation              |
| JWT + bcrypt         | Auth & password hashing |
| ES Modules           | Module system           |

### Frontend

| Technology         | Purpose      |
| ------------------ | ------------ |
| React + TypeScript | UI framework |
| Vite               | Build tool   |
| Tailwind CSS       | Styling      |
| React Router       | Navigation   |
| Axios              | HTTP client  |

---

## 🗂️ Project Structure

```
store-system/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   ├── user/
│       │   ├── category/
│       │   ├── product/
│       │   ├── inventory/
│       │   ├── sales/
│       │   └── reports/
│       ├── common/
│       │   ├── middlewares/
│       │   ├── utils/
│       │   └── errors/
│       ├── config/
│       └── routes/
│
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── pages/
        ├── hooks/
        ├── types/
        └── router/
```

---

## 🗄️ Database Schema

```
Category → Product → ProductVariant → StockMovement
                                    → SaleItem → Sale → User (cashier)
```

**Models:** `User`, `Category`, `Product`, `ProductVariant`, `Sale`, `SaleItem`, `StockMovement`

**Enums:** `Role` (ADMIN, CASHIER), `StockMovementType` (IN, OUT, ADJUSTMENT)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/store_db"
PORT=8000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

Run migrations and start:

```bash
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API requests to `http://localhost:8000`.

---

## 🔑 First Time Setup

On first run, create the admin account via:

```
POST /api/v1/auth/bootstrap-register
{
  "name": "Store Owner",
  "email": "owner@example.com",
  "password": "yourpassword"
}
```

This endpoint is only available once — it locks automatically after the first ADMIN is created.

---

## 📡 API Endpoints

### Auth

| Method | Endpoint                          | Description          | Access        |
| ------ | --------------------------------- | -------------------- | ------------- |
| POST   | `/api/v1/auth/bootstrap-register` | Create first admin   | Public (once) |
| POST   | `/api/v1/auth/login`              | Login                | Public        |
| POST   | `/api/v1/auth/refresh`            | Refresh access token | Public        |
| POST   | `/api/v1/auth/logout`             | Logout               | Auth          |

### Users

| Method | Endpoint                           | Description         | Access |
| ------ | ---------------------------------- | ------------------- | ------ |
| POST   | `/api/v1/users`                    | Create cashier      | ADMIN  |
| GET    | `/api/v1/users`                    | Get all users       | ADMIN  |
| GET    | `/api/v1/users/:id`                | Get user by ID      | ADMIN  |
| PATCH  | `/api/v1/users/:id`                | Update user         | ADMIN  |
| DELETE | `/api/v1/users/:id`                | Delete user         | ADMIN  |
| PATCH  | `/api/v1/users/me/change-password` | Change own password | Auth   |
| PATCH  | `/api/v1/users/:id/reset-password` | Reset user password | ADMIN  |

### Categories

| Method | Endpoint                 | Description        | Access |
| ------ | ------------------------ | ------------------ | ------ |
| POST   | `/api/v1/categories`     | Create category    | ADMIN  |
| GET    | `/api/v1/categories`     | Get all categories | Auth   |
| GET    | `/api/v1/categories/:id` | Get category by ID | Auth   |
| PATCH  | `/api/v1/categories/:id` | Update category    | ADMIN  |
| DELETE | `/api/v1/categories/:id` | Delete category    | ADMIN  |

### Products

| Method | Endpoint               | Description                  | Access |
| ------ | ---------------------- | ---------------------------- | ------ |
| POST   | `/api/v1/products`     | Create product with variants | ADMIN  |
| GET    | `/api/v1/products`     | Get all products             | Auth   |
| GET    | `/api/v1/products/:id` | Get product by ID            | Auth   |
| PATCH  | `/api/v1/products/:id` | Update product               | ADMIN  |
| DELETE | `/api/v1/products/:id` | Delete product               | ADMIN  |

### Inventory

| Method | Endpoint                               | Description            | Access |
| ------ | -------------------------------------- | ---------------------- | ------ |
| POST   | `/api/v1/inventory/stock-in`           | Add stock              | ADMIN  |
| POST   | `/api/v1/inventory/stock-out`          | Remove stock           | ADMIN  |
| POST   | `/api/v1/inventory/adjust`             | Manual adjustment      | ADMIN  |
| GET    | `/api/v1/inventory/:variantId/history` | Stock movement history | ADMIN  |

### Sales

| Method | Endpoint            | Description    | Access |
| ------ | ------------------- | -------------- | ------ |
| POST   | `/api/v1/sales`     | Create sale    | Auth   |
| GET    | `/api/v1/sales`     | Get all sales  | ADMIN  |
| GET    | `/api/v1/sales/:id` | Get sale by ID | ADMIN  |

### Reports

| Method | Endpoint                       | Description              | Access |
| ------ | ------------------------------ | ------------------------ | ------ |
| GET    | `/api/v1/reports/summary`      | Revenue & profit summary | ADMIN  |
| GET    | `/api/v1/reports/top-products` | Best selling products    | ADMIN  |
| GET    | `/api/v1/reports/low-stock`    | Low stock alerts         | ADMIN  |
| GET    | `/api/v1/reports/cashiers`     | Cashier performance      | ADMIN  |

---

## 🔒 Security Features

- Refresh token rotation on every refresh
- Refresh tokens hashed with SHA-256 before DB storage
- httpOnly cookies for refresh tokens
- Access tokens in memory only
- Password hashing with bcrypt
- Request rate limiting
- Input validation with Zod

---

## 🤝 Acknowledgements

The frontend UI was built with the assistance of **Claude** (by [Anthropic](https://anthropic.com)) as part of an AI-assisted development workflow. The backend was designed and implemented independently as a hands-on learning project in Node.js and TypeScript.
