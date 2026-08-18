terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" { default = "ap-south-1" }
variable "environment" { default = "production" }
variable "db_password" { sensitive = true }

# --- VPC ---
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "udaansetu-vpc", Environment = var.environment }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = { Name = "udaansetu-public-a" }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = { Name = "udaansetu-public-b" }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}a"
  tags = { Name = "udaansetu-private-a" }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "${var.aws_region}b"
  tags = { Name = "udaansetu-private-b" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "udaansetu-igw" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0"; gateway_id = aws_internet_gateway.main.id }
  tags = { Name = "udaansetu-public-rt" }
}

resource "aws_route_table_association" "public_a" { subnet_id = aws_subnet.public_a.id; route_table_id = aws_route_table.public.id }
resource "aws_route_table_association" "public_b" { subnet_id = aws_subnet.public_b.id; route_table_id = aws_route_table.public.id }

# --- ECR ---
resource "aws_ecr_repository" "backend" {
  name                 = "udaansetu-backend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "udaansetu-frontend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
}

# --- RDS PostgreSQL ---
resource "aws_db_subnet_group" "main" {
  name       = "udaansetu-db"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

resource "aws_security_group" "rds" {
  name   = "udaansetu-rds-sg"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 5432; to_port = 5432; protocol = "tcp"; security_groups = [aws_security_group.ecs.id] }
  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_db_instance" "main" {
  identifier           = "udaansetu-db"
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = "db.t3.medium"
  allocated_storage    = 20
  max_allocated_storage = 100
  db_name              = "udaansetu"
  username             = "udaansetu"
  password             = var.db_password
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  multi_az             = true
  backup_retention_period = 7
  skip_final_snapshot  = false
  final_snapshot_identifier = "udaansetu-final-snapshot"
  storage_encrypted    = true
  tags = { Environment = var.environment }
}

# --- ElastiCache Redis ---
resource "aws_elasticache_subnet_group" "main" {
  name       = "udaansetu-cache"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

resource "aws_security_group" "redis" {
  name   = "udaansetu-redis-sg"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 6379; to_port = 6379; protocol = "tcp"; security_groups = [aws_security_group.ecs.id] }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "udaansetu-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
}

# --- ECS Cluster ---
resource "aws_ecs_cluster" "main" {
  name = "udaansetu-cluster"
  setting { name = "containerInsights"; value = "enabled" }
}

resource "aws_security_group" "ecs" {
  name   = "udaansetu-ecs-sg"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 80; to_port = 80; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 443; to_port = 443; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

# --- CloudFront ---
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "alb"
  }
  enabled             = true
  default_root_object = ""
  aliases             = ["udaansetu.example.com"]
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "alb"
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values { query_string = true; headers = ["Host", "Authorization"] ; cookies { forward = "all" } }
  }
  restrictions { geo_restriction { restriction_type = "none" } }
  viewer_certificate { cloudfront_default_certificate = true }
}

# --- ALB ---
resource "aws_lb" "main" {
  name               = "udaansetu-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ecs.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
}

# --- Outputs ---
output "rds_endpoint" { value = aws_db_instance.main.endpoint }
output "redis_endpoint" { value = aws_elasticache_cluster.main.cache_nodes[0].address }
output "ecr_backend_url" { value = aws_ecr_repository.backend.repository_url }
output "ecr_frontend_url" { value = aws_ecr_repository.frontend.repository_url }
output "cloudfront_domain" { value = aws_cloudfront_distribution.main.domain_name }
output "alb_dns" { value = aws_lb.main.dns_name }
