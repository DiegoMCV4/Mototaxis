#!/bin/bash
# =============================================
# MotoTaxi - Script de Despliegue en AWS
# =============================================
# Requisitos:
# - AWS CLI configurado (aws configure)
# - Docker instalado
# - Cuenta de AWS con permisos para ECR, ECS, RDS
# =============================================

set -e

# Configuración
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
CLUSTER_NAME="mototaxi-cluster"

# Nombres de los servicios
SERVICES=("api-gateway" "auth-service" "rides-service" "ratings-service" "tracking-service" "payments-service")

echo "🚀 Iniciando despliegue de MotoTaxi en AWS"
echo "   Región: ${AWS_REGION}"
echo "   Cuenta: ${AWS_ACCOUNT_ID}"
echo ""

# ==================== PASO 1: Login en ECR ====================
echo "📦 Paso 1: Login en Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

# ==================== PASO 2: Crear repositorios ECR ====================
echo "📦 Paso 2: Creando repositorios ECR..."
for SERVICE in "${SERVICES[@]}"; do
    aws ecr describe-repositories --repository-names "mototaxi/${SERVICE}" --region ${AWS_REGION} 2>/dev/null || \
    aws ecr create-repository --repository-name "mototaxi/${SERVICE}" --region ${AWS_REGION}
    echo "   ✅ mototaxi/${SERVICE}"
done

# ==================== PASO 3: Build y Push de imágenes ====================
echo "🏗️ Paso 3: Construyendo y subiendo imágenes Docker..."
for SERVICE in "${SERVICES[@]}"; do
    echo "   Building ${SERVICE}..."
    docker build -t "mototaxi/${SERVICE}" "./services/${SERVICE}"
    docker tag "mototaxi/${SERVICE}:latest" "${ECR_REGISTRY}/mototaxi/${SERVICE}:latest"
    docker push "${ECR_REGISTRY}/mototaxi/${SERVICE}:latest"
    echo "   ✅ ${SERVICE} subido a ECR"
done

# ==================== PASO 4: Crear cluster ECS ====================
echo "🖥️ Paso 4: Creando cluster ECS..."
aws ecs describe-clusters --clusters ${CLUSTER_NAME} --region ${AWS_REGION} 2>/dev/null || \
aws ecs create-cluster --cluster-name ${CLUSTER_NAME} --region ${AWS_REGION}

# ==================== PASO 5: Crear base de datos RDS ====================
echo "🗄️ Paso 5: Verificando base de datos RDS..."
aws rds describe-db-instances --db-instance-identifier mototaxi-db --region ${AWS_REGION} 2>/dev/null || \
aws rds create-db-instance \
    --db-instance-identifier mototaxi-db \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0 \
    --master-username admin \
    --master-user-password mototaxi123 \
    --allocated-storage 20 \
    --db-name mototaxi \
    --publicly-accessible \
    --region ${AWS_REGION}

echo ""
echo "✅ ¡Despliegue iniciado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Esperar a que RDS esté disponible (~5-10 min)"
echo "   2. Obtener endpoint de RDS:"
echo "      aws rds describe-db-instances --db-instance-identifier mototaxi-db --query 'DBInstances[0].Endpoint.Address'"
echo "   3. Ejecutar init.sql en la base de datos RDS"
echo "   4. Crear task definitions en ECS con el endpoint de RDS"
echo "   5. Crear servicios ECS para cada microservicio"
echo ""
echo "📱 Para el frontend:"
echo "   1. npm run build (en la carpeta frontend)"
echo "   2. Subir el contenido de dist/ a un bucket S3"
echo "   3. Configurar CloudFront para servir el frontend"
