.PHONY: help install dev build start test lint format clean docker-up docker-down docker-logs migration-generate migration-run

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run start:dev

build: ## Build the application
	npm run build

start: ## Start production server
	npm run start:prod

test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-cov: ## Run tests with coverage
	npm run test:cov

test-e2e: ## Run E2E tests
	npm run test:e2e

lint: ## Run linter
	npm run lint

format: ## Format code
	npm run format

clean: ## Clean build artifacts
	rm -rf dist node_modules coverage

docker-up: ## Start Docker services
	docker-compose up -d

docker-down: ## Stop Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f app

docker-build: ## Build Docker image
	docker-compose build

docker-restart: ## Restart Docker services
	docker-compose restart

migration-generate: ## Generate migration (usage: make migration-generate name=MigrationName)
	npm run migration:generate -- src/infrastructure/database/migrations/$(name)

migration-run: ## Run migrations
	npm run migration:run

migration-revert: ## Revert last migration
	npm run migration:revert

db-up: ## Start only database
	docker-compose up -d postgres

db-down: ## Stop database
	docker-compose stop postgres
