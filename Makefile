.PHONY: dev-up dev-down k8s-apply k8s-delete clean test-db test-redis

dev-up:
docker compose up -d

dev-down:
docker compose down -v

k8s-apply:
kubectl apply -f deploy/k8s/base/postgres/
kubectl apply -f deploy/k8s/base/redis/

k8s-delete:
kubectl delete -f deploy/k8s/base/postgres/
kubectl delete -f deploy/k8s/base/redis/

test-db:
docker compose exec postgres psql -U ticketuser -d ticketdb -c "SELECT * FROM seats;"

test-redis:
docker compose exec redis redis-cli -a redispassword ping
