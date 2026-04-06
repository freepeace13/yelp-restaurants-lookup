# Local development tasks (requires GNU Make and a POSIX shell).

.PHONY: help install env setup dev lint build clean

help:
	@echo "Restaurant lookup — common targets"
	@echo ""
	@echo "  make install   Install npm dependencies (workspaces: client + server)"
	@echo "  make env       Create server/.env from server/.env.example if missing"
	@echo "  make setup     install + env (recommended for first-time local setup)"
	@echo "  make dev       Run client and API dev servers"
	@echo "  make lint      Run ESLint in client and server"
	@echo "  make build     Production build of the client (client/dist)"
	@echo "  make clean     Remove node_modules and client build output"
	@echo ""

install:
	npm install

env:
	@if [ -f server/.env ]; then \
		echo "server/.env already exists; not overwriting."; \
	else \
		cp server/.env.example server/.env; \
		echo "Created server/.env from server/.env.example"; \
		echo "Edit server/.env and set YELP_API_KEY (and PORT if needed)."; \
	fi

setup: install env
	@echo ""
	@echo "Setup complete. Run: make dev"

dev:
	npm run dev

lint:
	npm run lint

build:
	npm run build

clean:
	rm -rf node_modules client/node_modules server/node_modules client/dist
