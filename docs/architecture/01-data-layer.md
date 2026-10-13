# Phase 1: Data Layer & Persistence Architecture

## Overview
The persistence layer supports high-concurrency ticket locking and reliable transactional order processing.

### Components
1. **PostgreSQL 16**: Primary source of truth. Stores seat catalogs, inventory states, and completed sales orders.
2. **Redis 7**: Distributed in-memory store. Used for sub-millisecond atomic locking (distributed lock with TTL) to prevent double-booking during checkout windows.

## Local Setup
Run the persistence containers locally via Docker Compose:

\\\ash
docker compose up -d
docker compose exec postgres psql -U ticketuser -d ticketdb -c "SELECT * FROM seats;"
docker compose exec redis redis-cli -a redispassword ping
\\\

## Kubernetes Manifests Structure
- \deploy/k8s/base/postgres/\: Stateful Postgres setup mounted with a 1Gi PVC and seed data ConfigMap.
- \deploy/k8s/base/redis/\: Ephemeral, fast-recovery Redis Deployment with password authentication.
