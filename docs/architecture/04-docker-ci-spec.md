# Phase 4: Containerization & GitHub Actions CI

## Multi-stage Builds
- **Ticket Service**: Multi-stage Dockerfile pruning dev-dependencies, running as non-root `node` user.
- **Mock Payment**: Lightweight single-stage Alpine image running under unprivileged user.
- **Web Client**: Multi-stage build (Vite compilation to static assets, served via unprivileged Nginx Alpine reverse-proxy).

## Local Orchestration
- Orchestrated via `docker-compose.yml` with health checks on Postgres & Redis dependencies.
- Frontend exposed on port `8080`, reverse-proxying `/api` traffic to backend port `3000`.

## CI Pipeline (GitHub Actions)
- Matrix node dependency caching.
- Build validation across all sub-projects.
- Docker build verification via Docker Buildx.
