.PHONY: install run dev build clean

# Default target
all: install run

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Run development server
dev:
	@echo "Starting development server..."
	npm run dev

# Build for production
build:
	@echo "Building for production..."
	npm run build

# Run production build
run: build
	@echo "Starting production server..."
	npm run preview

# Clean installation
clean:
	@echo "Cleaning installation..."
	rm -rf node_modules
	rm -rf dist
	rm -f package-lock.json

# Help command
help:
	@echo "Available commands:"
	@echo "  make install  - Install dependencies"
	@echo "  make dev     - Start development server"
	@echo "  make build   - Build for production"
	@echo "  make run     - Build and run production server"
	@echo "  make clean   - Clean installation"
	@echo "  make help    - Show this help message" 