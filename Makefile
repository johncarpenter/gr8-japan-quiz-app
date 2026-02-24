.PHONY: install dev backend frontend stop clean

# Install all dependencies
install:
	cd backend && uv sync
	cd frontend && npm install

# Start both backend and frontend for development
dev: install
	@echo "Starting backend on :8000 and frontend on :5173..."
	@trap 'kill 0' INT TERM; \
		cd backend && uv run uvicorn main:app --reload --port 8000 & \
		cd frontend && npx vite --host & \
		wait

# Start backend only
backend:
	cd backend && uv run uvicorn main:app --reload --port 8000

# Start frontend only
frontend:
	cd frontend && npx vite --host

# Stop any running dev servers
stop:
	-lsof -ti :8000 | xargs kill 2>/dev/null
	-lsof -ti :5173 | xargs kill 2>/dev/null
	@echo "Stopped."

# Remove generated files
clean:
	rm -rf backend/.venv backend/uv.lock frontend/node_modules frontend/dist
