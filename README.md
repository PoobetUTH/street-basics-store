# 🛍️ STREET BASICS Online Store

ร้านค้าออนไลน์ที่ถูกออกแบบเป็น **Decoupled Microservices Architecture** แยก Frontend และ Backend อย่างชัดเจน พร้อม **CI/CD Pipeline**, **Kubernetes Deployment**, **Auto-Scaling** และ **Load Testing**

---

## 📁 Project Structure

```text
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

## 🏗️ Cloud Deployment Architecture

+----------------------------------------------------------------------------------+
| CLOUD (AWS) |
| Region: ap-southeast-1 |
+----------------------------------------------------------------------------------+

+---------------------------+
| User |
| (Browser / Client) |
+---------------------------+
|
| HTTP :80
v
+---------------------------+
| Internet Gateway |
| (IGW) |
+---------------------------+
|
v
+------------------------------------------------------------------+
| Application Load Balancer (PUBLIC) |
| Listener: HTTP :80 |
| Health Check -> Target Group (Frontend) |
+------------------------------------------------------------------+
|
| Forward to Target Group: Frontend :8080
v

+==================================================================================+
| VPC: 10.0.0.0/16 (ap-southeast-1) |
|----------------------------------------------------------------------------------|
| Public Subnets (Multi-AZ) | Private Subnets (Multi-AZ) |
| - ALB deployed across 2 AZs | - App runs here (ASG) |
|----------------------------------------------------------------------------------|
| Auto Scaling Group (CPU Target 50%) |
|----------------------------------------------------------------------------------|
| +----------------------------------+ +---------------------------------+|
| | AZ-A (ap-southeast-1b) | | AZ-B (ap-southeast-1c) ||
| | Private App Subnet | | Private App Subnet ||
| | | | ||
| | +----------------------------+ | | +----------------------------+ ||
| | | Frontend Node.js | | | | Frontend Node.js | ||
| | | Port :8080 | | | | Port :8080 | ||
| | +-------------+--------------+ | | +-------------+--------------+ ||
| | | | | | ||
| | | 2) API call | | | 2) API call ||
| | | HTTP :4000 | | | HTTP :4000 ||
| | v | | v ||
| | +----------------------------+ | | +----------------------------+ ||
| | | Backend API | | | | Backend API | ||
| | | Port :4000 | | | | Port :4000 | ||
| | +-------------+--------------+ | | +-------------+--------------+ ||
| +----------------|-----------------+ +----------------|----------------+|
| | 3) DB connect (TCP :5432) | |
+======================|=========================================|=================+
| |
v v
+----------------------------------------------------------------+
| Amazon RDS (PostgreSQL) |
| Port :5432 |
| Private DB Subnets (DB Subnet Group / Multi-AZ\*) |
+----------------------------------------------------------------+

### 📝 คำอธิบายการทำงาน (Architecture Flow)

1. **User Request**: ผู้ใช้งานเข้าสู่ระบบผ่าน Web Browser ข้อมูลจะวิ่งเข้าสู่ระบบบน AWS ผ่านทาง **Internet Gateway (IGW)**
2. **Load Balancer (ALB)**: Request จะถูกส่งต่อผ่านเครือข่าย Public Subnet มายังกลุ่ม **Application Load Balancer** ซึ่งจะทำหน้าที่รับโหลด HTTP Port 80 และกระจายโหลด (Routing) ข้าม Availability Zones ไปยังหน้าร้าน Frontend อย่างสมดุล
3. **Frontend Service**: รับ Request ในส่วนของการออกแบบ UI (HTML/CSS/JS) ที่รันผ่านคอนเทนเนอร์บน Port `8080` ซึ่งถูกจัดคิวอยู่ด้วย **Auto Scaling Group (ASG)** ครอบคลุมหลายโซนข้าม 2 Availability Zones สำหรับทำ Multi-AZ High Availability
4. **Backend API**: เมื่อมีการทำธุรกรรมภายในระบบ (เช่น ซื้อสินค้า, โหลดตะกร้า) ฝั่ง Frontend จะยิงการเชื่อมต่อภายในผ่าน HTTP Port `4000` ไปยังส่วน Backend API
5. **Auto-Scaling (HPA)**: ภายในตัวประมวลผลเซิร์ฟเวอร์ ถ้าพบความแออัด (Spike Load) จนอัตราการใช้ CPU ฝั่ง Backend แตะเป้าที่ 50% (Target 50%) ระบบ Autoscaler จะเริ่มสร้าง Pods ตัวทดแทนขึ้นมาให้เป็นไปตามภาระงานที่เพิ่มขึ้น เพื่อแก้ไขปัญหาการชะงักของฝั่ง Backend
6. **Database (RDS)**: สำหรับงานฐานข้อมูลประมวลผล ฝั่ง Backend จะตั้งเส้นขนานเชื่อมต่อ Private LAN แบบปิดมิดชิดผ่านพอร์ต `5432` ไปคุยกับ **PostgreSQL RDS** โดยเฉพาะ เพื่อเก็บเกี่ยวบันทึกข้อมูลและมีการ Replication สำรองข้อมูลไว้เช่นกัน
