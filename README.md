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

```mermaid
architecture-beta
    group aws(cloud)[AWS Cloud]

    group region(region)[Region us-east-1] in aws
    group vpc(vpc)[VPC] in region

    group igw_group(internet)[Internet] in vpc
    service users(users)[Users] in igw_group

    group alb_group(server)[Application Load Balancer] in vpc
    service alb(server)[Public HTTP/HTTPS] in alb_group

    group asg(server)[Auto Scaling Group - CPU 50%] in vpc

    group az_a(zone)[Availability Zone - A] in asg
    group subnet_a(subnet)[Private Subnet] in az_a
    service frontend_a(server)[Frontend Node.js :8080] in subnet_a
    service backend_a(server)[Backend API :4000] in subnet_a

    group az_b(zone)[Availability Zone - B] in asg
    group subnet_b(subnet)[Private Subnet] in az_b
    service frontend_b(server)[Frontend Node.js :8080] in subnet_b
    service backend_b(server)[Backend API :4000] in subnet_b

    group db_group(database)[Database Subnet] in vpc
    service rds(database)[Amazon RDS / PostgreSQL :5432] in db_group

    users:R --> L:alb
    alb:B --> T:frontend_a
    alb:B --> T:frontend_b

    frontend_a:B --> T:backend_a
    frontend_b:B --> T:backend_b

    backend_a:R --> L:rds
    backend_b:L --> R:rds
```

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

Pipeline ทำงานอัตโนมัติเมื่อ push ไปยัง `main` branch:

1. **Build** — สร้าง Docker image ของ frontend และ backend
2. **Push** — Push image ไปยัง Docker Hub (`poobetuth/streetbasics-*`)
3. **Deploy** — Deploy ไปยัง Kubernetes cluster

### GitHub Secrets ที่ต้องตั้ง

| Secret            | ค่า                                   |
| ----------------- | ------------------------------------- |
| `DOCKER_PASSWORD` | Docker Hub password หรือ access token |
| `KUBE_CONFIG`     | base64 encoded kubeconfig ของ cluster |

```bash
# สร้าง KUBE_CONFIG secret
cat ~/.kube/config | base64 | pbcopy
# แล้วนำไปวางใน GitHub → Settings → Secrets → KUBE_CONFIG
```

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
