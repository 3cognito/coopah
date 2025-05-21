test-dev:
	docker compose -f docker-compose.test.yaml up -d && npm run test-dev

test:
	docker compose -f docker-compose.test.yaml up -d && npm run test