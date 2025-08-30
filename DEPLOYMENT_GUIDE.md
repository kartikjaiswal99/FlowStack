# FlowStack Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying FlowStack in various environments, from local development to production-ready infrastructure.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Monitoring and Logging](#monitoring-and-logging)
6. [Backup and Recovery](#backup-and-recovery)

## Local Development Setup

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.8+)
- **PostgreSQL** (v13+)
- **UV** (Python package manager)
- **Git**

### Backend Setup

1. **Clone the repository:**
```bash
git clone https://github.com/kartikjaiswal99/FlowStack.git
cd FlowStack
```

2. **Install Python dependencies:**
```bash
cd backend
uv sync
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` file:
```bash
POSTGRES_URL=postgresql://username:password@localhost:5432/flowstack
GOOGLE_API_KEY=your_google_api_key
SERPAPI_API_KEY=your_serpapi_key
```

4. **Set up PostgreSQL database:**
```sql
CREATE DATABASE flowstack;
CREATE USER flowstack_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE flowstack TO flowstack_user;
```

5. **Run the backend server:**
```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install Node.js dependencies:**
```bash
cd frontend
npm install
```

2. **Configure API endpoint:**
```javascript
// src/api/axios.js
const API_BASE_URL = 'http://localhost:8000';
```

3. **Start the development server:**
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: flowstack
      POSTGRES_USER: flowstack_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flowstack_user -d flowstack"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      POSTGRES_URL: postgresql://flowstack_user:${POSTGRES_PASSWORD}@postgres:5432/flowstack
      GOOGLE_API_KEY: ${GOOGLE_API_KEY}
      SERPAPI_API_KEY: ${SERPAPI_API_KEY}
    volumes:
      - uploaded_files:/app/uploaded_files
      - chroma_data:/app/chroma_db
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: http://localhost:8000
    ports:
      - "3000:80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  uploaded_files:
  chroma_data:
```

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install UV
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install Python dependencies
RUN uv sync --frozen

# Copy application code
COPY . .

# Create directories for file storage
RUN mkdir -p uploaded_files chroma_db

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run the application
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # WebSocket support (if needed)
    location /ws {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Deployment Commands

```bash
# Create environment file
echo "POSTGRES_PASSWORD=secure_password" > .env
echo "GOOGLE_API_KEY=your_api_key" >> .env
echo "SERPAPI_API_KEY=your_serpapi_key" >> .env

# Deploy with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Clean up (removes volumes)
docker-compose down -v
```

## Production Deployment

### AWS Deployment

#### Architecture Overview
```
Internet → ALB → ECS Services → RDS/DocumentDB
                              ↓
                         S3 (File Storage)
```

#### ECS Task Definition

```json
{
  "family": "flowstack-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/flowstack-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "POSTGRES_URL",
          "value": "postgresql://user:pass@rds-endpoint:5432/flowstack"
        }
      ],
      "secrets": [
        {
          "name": "GOOGLE_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:flowstack/google-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/flowstack-backend",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/ || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

#### Terraform Configuration

```hcl
# main.tf
provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "flowstack-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = var.environment
  }
}

# RDS Database
resource "aws_db_instance" "flowstack" {
  identifier = "flowstack-${var.environment}"
  
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "flowstack"
  username = "flowstack_user"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.flowstack.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  
  tags = {
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "flowstack" {
  name = "flowstack-${var.environment}"
  
  capacity_providers = ["FARGATE"]
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "flowstack" {
  name               = "flowstack-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = module.vpc.public_subnets
  
  enable_deletion_protection = var.environment == "production"
}

# S3 Bucket for file storage
resource "aws_s3_bucket" "flowstack_files" {
  bucket = "flowstack-files-${var.environment}-${random_string.suffix.result}"
}

resource "aws_s3_bucket_versioning" "flowstack_files" {
  bucket = aws_s3_bucket.flowstack_files.id
  versioning_configuration {
    status = "Enabled"
  }
}
```

### Kubernetes Deployment

#### Backend Deployment

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flowstack-backend
  labels:
    app: flowstack-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: flowstack-backend
  template:
    metadata:
      labels:
        app: flowstack-backend
    spec:
      containers:
      - name: backend
        image: flowstack/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: POSTGRES_URL
          valueFrom:
            secretKeyRef:
              name: flowstack-secrets
              key: postgres-url
        - name: GOOGLE_API_KEY
          valueFrom:
            secretKeyRef:
              name: flowstack-secrets
              key: google-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: uploaded-files
          mountPath: /app/uploaded_files
        - name: chroma-data
          mountPath: /app/chroma_db
      volumes:
      - name: uploaded-files
        persistentVolumeClaim:
          claimName: flowstack-files-pvc
      - name: chroma-data
        persistentVolumeClaim:
          claimName: flowstack-chroma-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: flowstack-backend-service
spec:
  selector:
    app: flowstack-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

#### Frontend Deployment

```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flowstack-frontend
  labels:
    app: flowstack-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: flowstack-frontend
  template:
    metadata:
      labels:
        app: flowstack-frontend
    spec:
      containers:
      - name: frontend
        image: flowstack/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: flowstack-frontend-service
spec:
  selector:
    app: flowstack-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: ClusterIP
```

#### Ingress Configuration

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: flowstack-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - flowstack.example.com
    secretName: flowstack-tls
  rules:
  - host: flowstack.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: flowstack-backend-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: flowstack-frontend-service
            port:
              number: 80
```

## Environment Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
POSTGRES_URL=postgresql://username:password@localhost:5432/flowstack

# External APIs
GOOGLE_API_KEY=your_google_api_key
SERPAPI_API_KEY=your_serpapi_key

# Application Settings
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO

# File Storage
UPLOAD_DIR=uploaded_files
MAX_FILE_SIZE=10485760  # 10MB

# Security
SECRET_KEY=your_secret_key
ALLOWED_HOSTS=your-domain.com,localhost

# ChromaDB
CHROMA_PERSIST_DIRECTORY=chroma_db
```

#### Frontend (.env)
```bash
VITE_API_URL=https://api.flowstack.example.com
VITE_ENVIRONMENT=production
```

### Production Security

#### SSL/TLS Configuration
```bash
# Generate SSL certificate with Let's Encrypt
certbot --nginx -d flowstack.example.com

# Nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name flowstack.example.com;
    
    ssl_certificate /etc/letsencrypt/live/flowstack.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flowstack.example.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
}
```

## Monitoring and Logging

### Application Monitoring

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'flowstack-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: /metrics
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "FlowStack Monitoring",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "avg(rate(http_request_duration_seconds_sum[5m])) by (endpoint)"
          }
        ]
      },
      {
        "title": "Active Workflows",
        "type": "stat",
        "targets": [
          {
            "expr": "count(flowstack_active_workflows)"
          }
        ]
      }
    ]
  }
}
```

### Logging Configuration

#### Structured Logging
```python
# backend/logging_config.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
            
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
            
        return json.dumps(log_entry)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
logger.handlers[0].setFormatter(JSONFormatter())
```

## Backup and Recovery

### Database Backup
```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="flowstack"

# Create backup
pg_dump -h $POSTGRES_HOST -U $POSTGRES_USER $DB_NAME > $BACKUP_DIR/flowstack_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/flowstack_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/flowstack_$DATE.sql.gz s3://flowstack-backups/

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "flowstack_*.sql.gz" -mtime +7 -delete
```

### ChromaDB Backup
```bash
# Backup ChromaDB
tar -czf chroma_backup_$(date +%Y%m%d).tar.gz chroma_db/

# Upload to cloud storage
aws s3 cp chroma_backup_$(date +%Y%m%d).tar.gz s3://flowstack-backups/chroma/
```

### Disaster Recovery
```bash
# Recovery procedure
# 1. Restore database
gunzip -c flowstack_backup.sql.gz | psql -h $POSTGRES_HOST -U $POSTGRES_USER $DB_NAME

# 2. Restore ChromaDB
tar -xzf chroma_backup.tar.gz

# 3. Restore uploaded files
aws s3 sync s3://flowstack-backups/files/ uploaded_files/

# 4. Restart services
docker-compose restart
```

### Health Checks

#### Application Health Check
```python
# backend/health.py
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from database import SessionLocal
import chromadb

router = APIRouter()

@router.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "checks": {}
    }
    
    # Database check
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["checks"]["database"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    finally:
        db.close()
    
    # ChromaDB check
    try:
        client = chromadb.PersistentClient(path="chroma_db")
        client.heartbeat()
        health_status["checks"]["chromadb"] = "healthy"
    except Exception as e:
        health_status["checks"]["chromadb"] = f"unhealthy: {str(e)}"
        health_status["status"] = "unhealthy"
    
    if health_status["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=health_status)
    
    return health_status
```

This comprehensive deployment guide covers all aspects of deploying FlowStack from local development to production-ready infrastructure, including monitoring, logging, and disaster recovery procedures.