# Phase 7: GitOps Implementation with ArgoCD

## Overview
Automated deployment pipeline leveraging ArgoCD to continuously reconcile the Kubernetes cluster state with the Git repository (`charts/ticket-hub`).

## Features
- Declarative Application CRD tracking `main` branch.
- Automated sync policy with self-healing and pruning enabled.
- Single source of truth managed entirely via GitHub commits.
