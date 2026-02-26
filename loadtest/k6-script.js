/*
 * Load Testing — Street Basics Online Store
 * ==========================================
 * ใช้ k6 สำหรับทดสอบ load ของ API
 *
 * วิธีใช้:
 *   brew install k6          (macOS)
 *   k6 run k6-script.js      (รัน test)
 *   k6 run --vus 50 --duration 2m k6-script.js  (custom)
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// ============================================
// Test Configuration
// ============================================
export const options = {
  stages: [
    { duration: "30s", target: 20 }, // Ramp up to 20 users
    { duration: "1m", target: 50 }, // Ramp up to 50 users
    { duration: "2m", target: 100 }, // Peak at 100 users
    { duration: "1m", target: 50 }, // Scale down to 50
    { duration: "30s", target: 0 }, // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests < 500ms
    http_req_failed: ["rate<0.05"], // Less than 5% errors
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:4000";
const errorRate = new Rate("errors");

// ============================================
// Test Scenarios
// ============================================
export default function () {
  // Scenario 1: Health Check
  group("Health Check", function () {
    const res = http.get(`${BASE_URL}/api/health`);
    check(res, {
      "health status 200": (r) => r.status === 200,
      "health response ok": (r) => JSON.parse(r.body).status === "ok",
    });
    errorRate.add(res.status !== 200);
  });

  sleep(0.5);

  // Scenario 2: Browse Products
  group("Browse Products", function () {
    const res = http.get(`${BASE_URL}/api/products`);
    check(res, {
      "products status 200": (r) => r.status === 200,
      "products has data": (r) => JSON.parse(r.body).products.length > 0,
    });
    errorRate.add(res.status !== 200);
  });

  sleep(0.5);

  // Scenario 3: View Single Product
  group("View Product Detail", function () {
    const productId = Math.floor(Math.random() * 12) + 1;
    const res = http.get(`${BASE_URL}/api/products/${productId}`);
    check(res, {
      "product status 200": (r) => r.status === 200,
    });
    errorRate.add(res.status !== 200);
  });

  sleep(0.5);

  // Scenario 4: Register + Login + Order
  group("Full Shopping Flow", function () {
    const uniqueId = Math.floor(Math.random() * 1000000);
    const email = `k6test_${uniqueId}@test.com`;
    const password = "testpass123";

    // Register
    const registerRes = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify({
        name: `K6 User ${uniqueId}`,
        email: email,
        password: password,
      }),
      { headers: { "Content-Type": "application/json" } },
    );

    if (registerRes.status === 201) {
      const token = JSON.parse(registerRes.body).token;

      // Browse products
      http.get(`${BASE_URL}/api/products`);

      // Create order
      const orderRes = http.post(
        `${BASE_URL}/api/orders`,
        JSON.stringify({
          items: [{ productId: 1, quantity: 1 }],
        }),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      check(orderRes, {
        "order created": (r) => r.status === 201,
      });

      // View orders
      http.get(`${BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  });

  sleep(1);
}
