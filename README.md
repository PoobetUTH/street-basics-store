# 🛍️ STREET BASICS Online Store

ร้านค้าออนไลน์ที่ถูกออกแบบเป็น **Decoupled Microservices Architecture** แยก Frontend และ Backend อย่างชัดเจน

## Project Structure

```
├── frontend/              # Frontend Service (port 3000)
│   ├── public/            # Static files (HTML, CSS, JS, assets)
│   ├── server.js          # Express static server
│   ├── Dockerfile         # Nginx-based production image
│   └── package.json
│
├── backend/               # Backend API Service (port 4000)
│   ├── src/
│   │   ├── config/        # Environment-based configuration
│   │   ├── database/      # DB connection + seed data
│   │   ├── middleware/     # JWT authentication
│   │   ├── models/        # User, Product, Order models
│   │   ├── routes/        # API route handlers
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Entry point
│   ├── Dockerfile         # Node.js production image
│   └── package.json
│
├── docker-compose.yml     # Container orchestration
└── README.md
```

## Quick Start

### Development Mode

**Terminal 1 — Backend API (port 4000):**

```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend (port 3000):**

```bash
cd frontend
npm install
npm start
```

เปิด browser ไปที่ http://localhost:3000

### Docker Mode

```bash
docker-compose up --build
```

## API Endpoints

| Method | Endpoint             | Auth | Description          |
| ------ | -------------------- | ---- | -------------------- |
| POST   | `/api/auth/register` | ❌   | สมัครสมาชิก          |
| POST   | `/api/auth/login`    | ❌   | เข้าสู่ระบบ          |
| GET    | `/api/auth/me`       | ✅   | ดูข้อมูลผู้ใช้       |
| GET    | `/api/products`      | ❌   | ดูสินค้าทั้งหมด      |
| GET    | `/api/products/:id`  | ❌   | ดูสินค้ารายตัว       |
| POST   | `/api/orders`        | ✅   | สร้างคำสั่งซื้อ      |
| GET    | `/api/orders`        | ✅   | ดูประวัติการสั่งซื้อ |
| GET    | `/api/health`        | ❌   | Health check         |

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=4000
NODE_ENV=development
DB_PATH=./data/store.db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: Node.js, Express
- **Database**: SQLite (easily swappable to MySQL/PostgreSQL for production)
- **Auth**: JWT (JSON Web Tokens)
- **Container**: Docker + Docker Compose
