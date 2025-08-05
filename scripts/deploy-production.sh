#!/bin/bash

# AI Blog Platform - Production Deployment Script
# This script handles the complete deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="ai-blog-platform"
BACKEND_DIR="ai-blog-platform-backend"
FRONTEND_DIR="ai-blog-platform-frontend"
CONFIG_DIR="config"
TEST_DIR="test-scripts"

echo -e "${BLUE}🚀 Starting AI Blog Platform Production Deployment${NC}"
echo "=================================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed. Aborting."; exit 1; }
    command -v npm >/dev/null 2>&1 || { print_error "npm is required but not installed. Aborting."; exit 1; }
    command -v git >/dev/null 2>&1 || { print_error "git is required but not installed. Aborting."; exit 1; }
    
    print_status "All dependencies are installed"
}

# Check environment configuration
check_environment() {
    print_info "Checking environment configuration..."
    
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        print_warning "Backend .env file not found"
        if [ -f "$CONFIG_DIR/production.env.example" ]; then
            print_info "Copying example environment file..."
            cp "$CONFIG_DIR/production.env.example" "$BACKEND_DIR/.env"
            print_warning "Please edit $BACKEND_DIR/.env with your actual configuration values"
            read -p "Press Enter to continue after configuring environment variables..."
        else
            print_error "No environment configuration found. Please create $BACKEND_DIR/.env"
            exit 1
        fi
    fi
    
    print_status "Environment configuration found"
}

# Install backend dependencies
install_backend() {
    print_info "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    
    # Clean install
    rm -rf node_modules package-lock.json 2>/dev/null || true
    npm install --production
    
    print_status "Backend dependencies installed"
    cd ..
}

# Install frontend dependencies
install_frontend() {
    print_info "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    
    # Clean install
    rm -rf node_modules package-lock.json .next 2>/dev/null || true
    npm install --legacy-peer-deps
    
    print_status "Frontend dependencies installed"
    cd ..
}

# Build frontend for production
build_frontend() {
    print_info "Building frontend for production..."
    cd "$FRONTEND_DIR"
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the application
    npm run build
    
    print_status "Frontend built successfully"
    cd ..
}

# Run tests
run_tests() {
    print_info "Running production tests..."
    
    # Install test dependencies
    cd "$TEST_DIR"
    npm install
    
    # Run backend tests
    print_info "Running backend API tests..."
    npm run test:backend || {
        print_warning "Backend tests failed. Continue anyway? (y/n)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_error "Deployment aborted due to test failures"
            exit 1
        fi
    }
    
    print_status "Tests completed"
    cd ..
}

# Setup database
setup_database() {
    print_info "Setting up database..."
    cd "$BACKEND_DIR"
    
    # Run database setup script if it exists
    if [ -f "scripts/seedDatabase.js" ]; then
        node scripts/seedDatabase.js
        print_status "Database seeded successfully"
    else
        print_warning "No database seed script found"
    fi
    
    cd ..
}

# Create systemd service files (for Linux)
create_systemd_services() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_info "Creating systemd service files..."
        
        # Backend service
        sudo tee /etc/systemd/system/ai-blog-backend.service > /dev/null <<EOF
[Unit]
Description=AI Blog Platform Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)/$BACKEND_DIR
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

        # Frontend service
        sudo tee /etc/systemd/system/ai-blog-frontend.service > /dev/null <<EOF
[Unit]
Description=AI Blog Platform Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)/$FRONTEND_DIR
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

        sudo systemctl daemon-reload
        print_status "Systemd services created"
    else
        print_warning "Systemd services not created (not on Linux)"
    fi
}

# Start services
start_services() {
    print_info "Starting services..."
    
    # Start backend
    cd "$BACKEND_DIR"
    if [[ "$OSTYPE" == "linux-gnu"* ]] && command -v systemctl >/dev/null 2>&1; then
        sudo systemctl enable ai-blog-backend
        sudo systemctl start ai-blog-backend
        print_status "Backend service started with systemd"
    else
        # Start with PM2 if available, otherwise with nohup
        if command -v pm2 >/dev/null 2>&1; then
            pm2 start server.js --name "ai-blog-backend"
            pm2 save
            print_status "Backend started with PM2"
        else
            nohup node server.js > ../logs/backend.log 2>&1 &
            echo $! > ../logs/backend.pid
            print_status "Backend started with nohup"
        fi
    fi
    cd ..
    
    # Start frontend
    cd "$FRONTEND_DIR"
    if [[ "$OSTYPE" == "linux-gnu"* ]] && command -v systemctl >/dev/null 2>&1; then
        sudo systemctl enable ai-blog-frontend
        sudo systemctl start ai-blog-frontend
        print_status "Frontend service started with systemd"
    else
        if command -v pm2 >/dev/null 2>&1; then
            pm2 start npm --name "ai-blog-frontend" -- start
            pm2 save
            print_status "Frontend started with PM2"
        else
            nohup npm start > ../logs/frontend.log 2>&1 &
            echo $! > ../logs/frontend.pid
            print_status "Frontend started with nohup"
        fi
    fi
    cd ..
}

# Create log directory
create_logs_dir() {
    mkdir -p logs
    print_status "Log directory created"
}

# Setup nginx configuration (optional)
setup_nginx() {
    if command -v nginx >/dev/null 2>&1; then
        print_info "Setting up nginx configuration..."
        
        sudo tee /etc/nginx/sites-available/ai-blog-platform > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;  # Change this to your domain
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        sudo ln -sf /etc/nginx/sites-available/ai-blog-platform /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        print_status "Nginx configuration created"
    else
        print_warning "Nginx not found, skipping reverse proxy setup"
    fi
}

# Main deployment function
main() {
    print_info "Starting deployment process..."
    
    check_dependencies
    check_environment
    create_logs_dir
    install_backend
    install_frontend
    build_frontend
    setup_database
    run_tests
    create_systemd_services
    start_services
    setup_nginx
    
    echo ""
    echo "=================================================="
    print_status "🎉 Deployment completed successfully!"
    echo ""
    print_info "Services are running on:"
    print_info "  Frontend: http://localhost:3001"
    print_info "  Backend:  http://localhost:5001"
    print_info "  API:      http://localhost:5001/api"
    echo ""
    print_info "Log files are available in the 'logs' directory"
    print_info "To monitor services:"
    if command -v pm2 >/dev/null 2>&1; then
        print_info "  pm2 status"
        print_info "  pm2 logs"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_info "  sudo systemctl status ai-blog-backend"
        print_info "  sudo systemctl status ai-blog-frontend"
    else
        print_info "  Check logs directory for output"
    fi
    echo ""
    print_warning "Don't forget to:"
    print_warning "  1. Configure your domain in nginx (if using)"
    print_warning "  2. Set up SSL certificates"
    print_warning "  3. Configure firewall rules"
    print_warning "  4. Set up monitoring and backups"
}

# Run main function
main "$@"
