# 🛍️ STREET BASICS Online Store

ร้านค้าออนไลน์ที่ถูกออกแบบเป็น **Decoupled Microservices Architecture** แยก Frontend และ Backend อย่างชัดเจน พร้อม **CI/CD Pipeline**, **Kubernetes Deployment**, **Auto-Scaling** และ **Load Testing**

---

## 📁 Project Structure

```
├── frontend/                  # Frontend Service (port 8080)
│   ├── public/                # Static files (HTML, CSS, JS, assets)
│   ├── server.js              # Express static server
│   ├── Dockerfile             # Node.js production image
│   └── package.json
│
├── backend/                   # Backend API Service (port 4000)
│   ├── src/
│   │   ├── config/            # Environment-based configuration
│   │   ├── database/          # PostgreSQL connection + seed data
│   │   ├── middleware/        # JWT authentication
│   │   ├── models/            # User, Product, Order models
│   │   ├── routes/            # API route handlers
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # Entry point
│   ├── Dockerfile             # Node.js production image
│   └── package.json
│
├── k8s/                       # Kubernetes Manifests
│   ├── namespace.yaml         # Namespace: street-basics
│   ├── postgres.yaml          # PostgreSQL (Secret + PVC + Deployment + Service)
│   ├── backend.yaml           # Backend (Deployment + Service)
│   ├── frontend.yaml          # Frontend (Deployment + LoadBalancer)
│   └── hpa.yaml               # HorizontalPodAutoscaler (auto-scaling)
│
├── .github/workflows/
│   └── ci-cd.yml              # GitHub Actions CI/CD Pipeline
│
├── loadtest/                  # Load Testing
│   ├── locustfile.py          # Locust load test script
│   ├── k6-script.js           # k6 load test script
│   └── README.md              # วิธีรัน load test
│
├── docker-compose.yml         # Local container orchestration
└── README.md
```

---

## 🏗️ Architecture

+----------------------------------------------------------------------------------+
|                                   CLOUD (AWS)                                    |
|                             Region: ap-southeast-1                               |
+----------------------------------------------------------------------------------+

+---------------------------+
|           User            |
|     (Browser / Client)    |
+---------------------------+
             |
             | HTTP :80
             v
+---------------------------+
|     Internet Gateway      |
|           (IGW)           |
+---------------------------+
             |
             v
+------------------------------------------------------------------+
|                 Application Load Balancer (PUBLIC)               |
|                 Listener: HTTP :80                               |
|                 Health Check -> Target Group (Frontend)          |
+------------------------------------------------------------------+
             |
             | Forward to Target Group: Frontend :8080
             v

+==================================================================================+
|                           VPC: 10.0.0.0/16 (ap-southeast-1)                       |
|----------------------------------------------------------------------------------|
|   Public Subnets (Multi-AZ)                 |   Private Subnets (Multi-AZ)        |
|   - ALB deployed across 2 AZs               |   - App runs here (ASG)             |
|----------------------------------------------------------------------------------|
|                 Auto Scaling Group (CPU Target 50%)                               |
|----------------------------------------------------------------------------------|
|     +----------------------------------+      +---------------------------------+|
|     |     AZ-A  (ap-southeast-1b)      |      |     AZ-B  (ap-southeast-1c)     ||
|     |     Private App Subnet           |      |     Private App Subnet          ||
|     |                                  |      |                                 ||
|     |  +----------------------------+  |      |  +----------------------------+ ||
|     |  | Frontend Node.js           |  |      |  | Frontend Node.js           | ||
|     |  | Port :8080                 |  |      |  | Port :8080                 | ||
|     |  +-------------+--------------+  |      |  +-------------+--------------+ ||
|     |                |                 |      |                |                ||
|     |                | 2) API call     |      |                | 2) API call    ||
|     |                |    HTTP :4000   |      |                |    HTTP :4000  ||
|     |                v                 |      |                v                ||
|     |  +----------------------------+  |      |  +----------------------------+ ||
|     |  | Backend API                |  |      |  | Backend API                | ||
|     |  | Port :4000                 |  |      |  | Port :4000                 | ||
|     |  +-------------+--------------+  |      |  +-------------+--------------+ ||
|     +----------------|-----------------+      +----------------|----------------+|
|                      | 3) DB connect (TCP :5432)               |                 |
+======================|=========================================|=================+
                       |                                         |
                       v                                         v
            +----------------------------------------------------------------+
            |                 Amazon RDS (PostgreSQL)                        |
            |                 Port :5432                                     |
            |          Private DB Subnets (DB Subnet Group / Multi-AZ*)      |
            +----------------------------------------------------------------+

---

## 🚀 Quick Start

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

### Docker Compose Mode

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- PostgreSQL: localhost:5432

---

## ☸️ Kubernetes Deployment

### Prerequisites

- Docker + Docker Hub account
- kubectl + Kubernetes cluster (Minikube / Docker Desktop / Cloud)

### Step 1: Build & Push Docker Images

```bash
# Login Docker Hub
docker login

# Build & push backend
docker build -t poobetuth/streetbasics-backend:latest ./backend
docker push poobetuth/streetbasics-backend:latest

# Build & push frontend
docker build -t poobetuth/streetbasics-frontend:latest ./frontend
docker push poobetuth/streetbasics-frontend:latest
```

### Step 2: Deploy to Kubernetes

```bash
# Apply all manifests (ตามลำดับ)
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/hpa.yaml
```

### Step 3: Verify

```bash
# ดู Pods
kubectl get pods -n street-basics

# ดู Services
kubectl get svc -n street-basics

# ดู HPA
kubectl get hpa -n street-basics

# ดู External IP ของ Frontend
kubectl get svc frontend-service -n street-basics
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

```mermaid
architecture-beta
    group user_env(cloud)[Local Environment]
    service dev(server)[Local Mac] in user_env

    group github_cloud(cloud)[GitHub Cloud]
    service repo(database)[Source Code Repository] in github_cloud
    service actions(server)[GitHub Actions CI/CD] in github_cloud

    group docker_cloud(cloud)[Docker Hub]
    service registry(database)[poobetuth/*:latest] in docker_cloud

    group aws(cloud)[AWS Cloud]
    group region(region)[Region us-east-1] in aws
    service ec2(server)[EC2 t3.small / Minikube] in region

    dev:R --> L:repo
    repo:B --> T:actions
    actions:R --> L:registry
    registry:B --> T:ec2
    actions:B --> L:ec2
```

Pipeline ทำงานอัตโนมัติเมื่อมีการ `push` โค้ดไปยัง `main` branch:

### GitHub Secrets ที่ต้องตั้ง

| Secret            | ค่า                                     |
| ----------------- | --------------------------------------- |
| `DOCKER_PASSWORD` | Docker Hub password หรือ access token   |
| `EC2_HOST`        | IP ของเครื่อง AWS EC2 (เช่น 47.130.x.x) |
| `EC2_USERNAME`    | `ec2-user`                              |
| `EC2_SSH_KEY`     | ข้อความในไฟล์กุญแจ `.pem` ทั้งหมด       |

**วิธีเพิ่มกุญแจ .pem เข้า GitHub:**

1. เปิดไฟล์กุญแจที่โหลดมาจาก AWS (เช่น `my-key.pem`) ด้วยโปรแกรม Text Editor
2. ก๊อปปี้ข้อความทั้งหมดตั้งแต่ `-----BEGIN RSA PRIVATE KEY-----` ยันบรรทัดสุดท้าย
3. นำไปวางใน GitHub → Settings → Secrets and variables → Actions → New repository secret

---

## 🔥 Load Testing

ดูรายละเอียดที่ [loadtest/README.md](loadtest/README.md)

```bash
# Option A: Locust
pip install locust
locust -f loadtest/locustfile.py --host=http://localhost:4000

# Option B: k6
brew install k6
k6 run loadtest/k6-script.js
```

### ดู Auto-Scaling ขณะ Load Test

```bash
kubectl get hpa -n street-basics -w    # ดู HPA scaling
kubectl get pods -n street-basics -w   # ดู pods เพิ่ม/ลด
```

---

## 📡 API Endpoints

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

---

## 🛠 Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Auth**: JWT (JSON Web Tokens)
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes + HPA (auto-scaling)
- **CI/CD**: GitHub Actions
- **Load Testing**: Locust / k6
