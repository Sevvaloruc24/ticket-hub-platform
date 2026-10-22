# Phase 6: Helm Packaging & Release Management

## Overview
Encapsulates all platform components (`postgres`, `redis`, `mock-payment`, `ticket-service`, `web`, `HPA`, `Ingress`) into a single reusable Helm Chart (`charts/ticket-hub`).

## Capabilities
- Dynamic replica management and resource limits via `values.yaml`.
- Conditional rendering for HPA and Ingress controllers.
- Unified labels and chart naming conventions via `_helpers.tpl`.
- Single-command lifecycle management (`helm install`, `helm upgrade`, `helm uninstall`).
