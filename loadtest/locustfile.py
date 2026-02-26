"""
Load Testing — Street Basics Online Store
==========================================
ใช้ Locust สำหรับทดสอบ load ของ API

วิธีใช้:
  pip install locust
  locust -f locustfile.py --host=http://localhost:4000

เปิด browser ไปที่ http://localhost:8089 เพื่อเริ่ม test
"""

from locust import HttpUser, task, between, SequentialTaskSet
import json
import random


class BrowsingUser(HttpUser):
    """ผู้ใช้ที่เข้ามาเปิดดูสินค้า (ไม่ต้อง login)"""
    weight = 3  # 60% ของ traffic
    wait_time = between(1, 3)

    @task(3)
    def health_check(self):
        self.client.get("/api/health")

    @task(5)
    def browse_products(self):
        self.client.get("/api/products")

    @task(2)
    def view_single_product(self):
        product_id = random.randint(1, 12)
        self.client.get(f"/api/products/{product_id}")


class ShoppingUser(HttpUser):
    """ผู้ใช้ที่ login แล้วสั่งซื้อสินค้า"""
    weight = 2  # 40% ของ traffic
    wait_time = between(2, 5)

    def on_start(self):
        """Register + Login เมื่อเริ่มต้น"""
        unique_id = random.randint(100000, 999999)
        self.email = f"loadtest_{unique_id}@test.com"
        self.password = "testpass123"
        self.token = None

        # Register
        res = self.client.post("/api/auth/register", json={
            "name": f"Test User {unique_id}",
            "email": self.email,
            "password": self.password,
        })

        if res.status_code == 201:
            data = res.json()
            self.token = data.get("token")
        else:
            # Try login if already registered
            res = self.client.post("/api/auth/login", json={
                "email": self.email,
                "password": self.password,
            })
            if res.status_code == 200:
                data = res.json()
                self.token = data.get("token")

    def get_headers(self):
        if self.token:
            return {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            }
        return {"Content-Type": "application/json"}

    @task(4)
    def browse_products(self):
        self.client.get("/api/products")

    @task(3)
    def view_product(self):
        product_id = random.randint(1, 12)
        self.client.get(f"/api/products/{product_id}")

    @task(2)
    def create_order(self):
        if not self.token:
            return

        items = [
            {"productId": random.randint(1, 6), "quantity": 1},
        ]

        self.client.post(
            "/api/orders",
            json={"items": items},
            headers=self.get_headers(),
        )

    @task(1)
    def view_orders(self):
        if not self.token:
            return

        self.client.get(
            "/api/orders",
            headers=self.get_headers(),
        )

    @task(1)
    def check_profile(self):
        if not self.token:
            return

        self.client.get(
            "/api/auth/me",
            headers=self.get_headers(),
        )
