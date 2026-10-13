# Phase 3: Frontend Web Client (React + Vite)

## Architecture Overview
The frontend client provides real-time seat inventory polling and atomic checkout lock interaction.

### Features
1. **Interactive Seat Map**: Real-time visualization of seat statuses (`AVAILABLE`, `LOCKED`, `SOLD`).
2. **Distributed Lock Sync**: Initiates backend lock reservation with an ephemeral UUID identifier.
3. **Checkout Countdown Timer**: Visual countdown linked to Redis key TTL (120s), expiring UI lock automatically when invalidated.
4. **Proxy Layer**: Vite dev server proxies `/api` calls directly to `ticket-service` (port 3000).
