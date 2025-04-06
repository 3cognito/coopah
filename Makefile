run-tests:
	docker compose -f docker-compose.test.yaml up -d && npm run test-dev