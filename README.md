# Ticket-Hub Platform

End-to-End Cloud-Native Microservices & DevOps Architecture on Kubernetes.

## 🚀 Overview
Ticket-Hub is a distributed event ticketing platform built to demonstrate enterprise Kubernetes deployment patterns, dynamic Helm chart templating, GitOps continuous delivery, and full-stack observability.

---

## 🛠 Tech Stack & Architecture
- **Core Workloads:** Node.js Microservices (`ticket-service`, `mock-payment`, `web`)
- **State & Caching:** PostgreSQL & Redis
- **Containerization & Orchestration:** Docker, Minikube (Kubernetes v1.30+)
- **Packaging:** Modular Helm 3 Chart with parameterized `values.yaml`
- **GitOps Continuous Delivery:** ArgoCD (`Application` CRD with automated sync and self-healing)
- **Observability:** Prometheus Operator (`kube-prometheus-stack`), `ServiceMonitor`, and Grafana dashboards

---

## 📂 Architecture Phases Implemented
1. **Containerization:** Production Dockerfiles with multi-stage builds.
2. **Kubernetes Manifests:** Deployments, Services, ConfigMaps, Secrets, and PVCs.
3. **Ingress & Networking:** Path-based Nginx ingress routing.
4. **Auto-scaling:** Horizontal Pod Autoscaler (HPA) CPU threshold policies.
5. **Helm Packaging:** Centralized chart templates under `infra/helm/ticket-hub/`.
6. **GitOps with ArgoCD:** Continuous reconciliation connected to repository root.
7. **Observability:** Metric export via `/metrics`, scraped by Prometheus and visualized in Grafana.

---

## 📈 Monitoring & Access
- **ArgoCD Dashboard:** Port-forwarded at `https://localhost:8085`
- **Grafana Metrics:** Port-forwarded at `http://localhost:3001`
- **Web Interface:** Accessible via Minikube tunnel / Ingress
