# Phase 2: Core Backend Architecture & API Contracts

## Service Overview
- **`ticket-service`**: Handles catalog queries, distributed locking via Redis with TTL, and checkout operations.
- **`mock-external-service`**: Simulates third-party payment gateway latency and approval flow.

## API Contracts

### 1. `GET /seats`
Returns all seats enriched with Redis distributed lock state.

### 2. `POST /seats/:id/lock`
Acquires an atomic distributed lock via Redis `SET key value EX 120 NX`.
- Request Body: `{"userId": "user-uuid"}`
- Status 200: Lock acquired.
- Status 409: Seat already sold or locked.

### 3. `POST /buy`
Verifies user lock ownership, invokes mock payment gateway, updates seat status to `SOLD`, inserts order record in Postgres, and releases Redis lock.
- Request Body: `{"seatId": 1, "userId": "user-uuid", "customerEmail": "user@example.com"}`

### 4. `GET /metrics`
Exposes Prometheus runtime and business metrics (`http_requests_total`, `ticket_purchases_total`).
