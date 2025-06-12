#!/bin/bash

# Script để quản lý các microservice trong Docker Compose
# Sử dụng: ./scripts/docker-dev.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker and Docker Compose are installed
check_prerequisites() {
    log_info "Kiểm tra prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker không được cài đặt!"
        exit 1
    fi
    
    # Check for Docker Compose (v2 or legacy)
    if command -v "docker compose" &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
    else
        log_error "Docker Compose không được cài đặt!"
        log_info "Hãy cài đặt Docker Compose hoặc sử dụng 'docker compose' plugin"
        exit 1
    fi
    
    log_success "Prerequisites đã sẵn sàng (using: $DOCKER_COMPOSE_CMD)"
}

# Build all microservices
build_services() {
    log_info "Building các microservice..."
    
    if [ "$1" == "--no-cache" ]; then
        log_warning "Building với --no-cache (chậm hơn nhưng build fresh)"
        $DOCKER_COMPOSE_CMD -f compose-dev.yml build --no-cache \
            api-gateway \
            academic-service \
            faculty-service-it \
            faculty-service-tel \
            tuition-service
    else
        $DOCKER_COMPOSE_CMD -f compose-dev.yml build \
            api-gateway \
            academic-service \
            faculty-service-it \
            faculty-service-tel \
            tuition-service
    fi
    
    log_success "Build hoàn thành!"
}

# Start all services
start_services() {
    log_info "Khởi động tất cả services..."
    
    # Start infrastructure services first
    $DOCKER_COMPOSE_CMD -f compose-dev.yml up -d \
        coordinator0 \
        worker0 \
        worker1 \
        manager0 \
        acc-postgres-db \
        proxydb
    
    log_info "Đợi database khởi động..."
    sleep 10
    
    # Start microservices
    $DOCKER_COMPOSE_CMD -f compose-dev.yml up -d \
        academic-service \
        faculty-service-it \
        faculty-service-tel \
        tuition-service
    
    log_info "Đợi microservice khởi động..."
    sleep 5
    
    # Start API Gateway
    $DOCKER_COMPOSE_CMD -f compose-dev.yml up -d api-gateway
    
    log_success "Tất cả services đã khởi động!"
}

# Stop all services
stop_services() {
    log_info "Dừng tất cả services..."
    $DOCKER_COMPOSE_CMD -f compose-dev.yml down
    log_success "Đã dừng tất cả services!"
}

# Restart microservices only
restart_microservices() {
    log_info "Restart microservices..."
    
    $DOCKER_COMPOSE_CMD -f compose-dev.yml restart \
        api-gateway \
        academic-service \
        faculty-service-it \
        faculty-service-tel \
        tuition-service
    
    log_success "Microservices đã restart!"
}

# Show logs for specific service
show_logs() {
    if [ -z "$2" ]; then
        log_error "Vui lòng chỉ định service name!"
        log_info "Ví dụ: ./scripts/docker-dev.sh logs academic-service"
        exit 1
    fi
    
    $DOCKER_COMPOSE_CMD -f compose-dev.yml logs -f "$2"
}

# Show status of all services
show_status() {
    log_info "Trạng thái các services:"
    $DOCKER_COMPOSE_CMD -f compose-dev.yml ps
}

# Build single service for debugging
build_single_service() {
    if [ -z "$2" ]; then
        log_error "Vui lòng chỉ định service name!"
        log_info "Services có sẵn: academic-service, faculty-service-it, faculty-service-tel, tuition-service, api-gateway"
        exit 1
    fi
    
    log_info "Building service: $2"
    
    if [ "$3" == "--no-cache" ]; then
        log_warning "Building với --no-cache"
        $DOCKER_COMPOSE_CMD -f compose-dev.yml build --no-cache "$2"
    else
        $DOCKER_COMPOSE_CMD -f compose-dev.yml build "$2"
    fi
    
    log_success "Build $2 hoàn thành!"
}

# Clean up everything
cleanup() {
    log_warning "Xóa tất cả containers, volumes và networks..."
    read -p "Bạn có chắc chắn? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        $DOCKER_COMPOSE_CMD -f compose-dev.yml down -v --remove-orphans
        docker system prune -f
        log_success "Cleanup hoàn thành!"
    else
        log_info "Hủy cleanup."
    fi
}

# Show help
show_help() {
    echo "Sử dụng: ./scripts/docker-dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build [--no-cache]        Build tất cả microservices"
    echo "  build-single <service>    Build service cụ thể để debug"
    echo "  start                     Khởi động tất cả services"
    echo "  stop                      Dừng tất cả services"
    echo "  restart                   Restart chỉ microservices"
    echo "  logs <service>            Xem logs của service cụ thể"
    echo "  status                    Hiển thị trạng thái các services"
    echo "  cleanup                   Xóa tất cả containers và volumes"
    echo "  help                      Hiển thị help này"
    echo ""
    echo "Ví dụ:"
    echo "  ./scripts/docker-dev.sh build"
    echo "  ./scripts/docker-dev.sh build --no-cache"
    echo "  ./scripts/docker-dev.sh build-single academic-service"
    echo "  ./scripts/docker-dev.sh start"
    echo "  ./scripts/docker-dev.sh logs academic-service"
    echo "  ./scripts/docker-dev.sh status"
}

# Main command handling
case "${1:-help}" in
    "build")
        check_prerequisites
        build_services "$2"
        ;;
    "start")
        check_prerequisites
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_microservices
        ;;
    "logs")
        show_logs "$@"
        ;;
    "status")
        show_status
        ;;
    "build-single")
        check_prerequisites
        build_single_service "$@"
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac 