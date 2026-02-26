# 🔥 Load Testing — Street Basics

ใช้สำหรับทดสอบ performance ของ API และพิสูจน์ว่า auto-scaling ทำงานได้จริง

## วิธีที่ 1: Locust (Python)

### ติดตั้ง

```bash
pip install locust
```

### รัน

```bash
cd loadtest
locust -f locustfile.py --host=http://localhost:4000
```

เปิด browser → **http://localhost:8089**

- ตั้ง Number of users: **100**
- ตั้ง Spawn rate: **10** (users/sec)
- กด **Start swarming**

### รัน Headless (ไม่ต้องเปิด browser)

```bash
locust -f locustfile.py --host=http://localhost:4000 \
  --headless -u 100 -r 10 --run-time 3m
```

---

## วิธีที่ 2: k6

### ติดตั้ง

```bash
brew install k6        # macOS
```

### รัน

```bash
k6 run loadtest/k6-script.js
```

### รัน Custom

```bash
k6 run --vus 50 --duration 2m loadtest/k6-script.js
```

### ชี้ไปที่ K8s Service

```bash
k6 run -e BASE_URL=http://<EXTERNAL-IP>:4000 loadtest/k6-script.js
```

---

## ดู Auto-Scaling ขณะ Load Test

เปิด terminal อีกหน้าต่างพร้อมกับ load test:

```bash
# ดู HPA scaling แบบ realtime
kubectl get hpa -n street-basics -w

# ดู pods เพิ่ม/ลด แบบ realtime
kubectl get pods -n street-basics -w

# ดู resource usage
kubectl top pods -n street-basics
```

## ผลที่คาดหวัง

| ขั้นตอน             | คาดหวัง                                        |
| ------------------- | ---------------------------------------------- |
| เริ่มต้น            | Backend 2 pods, Frontend 2 pods                |
| Load test 50 users  | Backend เพิ่มเป็น 3-4 pods                     |
| Load test 100 users | Backend เพิ่มเป็น 5-8 pods                     |
| หยุด load test      | Pods ค่อยๆ ลดกลับมา 2 pods (ใช้เวลา ~2-5 นาที) |
