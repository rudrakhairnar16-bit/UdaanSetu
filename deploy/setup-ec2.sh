#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# UdaanSetu — AWS EC2 Deployment Script
# Run this on a fresh Ubuntu 22.04/24.04 EC2 instance
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

echo "🚀 UdaanSetu AWS Deployment Starting..."
echo "======================================"

# ── 1. System update ──
echo ""
echo "📦 [1/6] Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# ── 2. Install Docker ──
echo ""
echo "🐳 [2/6] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sudo sh
    sudo usermod -aG docker $USER
    echo "Docker installed. You may need to log out and back in."
else
    echo "Docker already installed: $(docker --version)"
fi

# ── 3. Install Docker Compose ──
echo ""
echo "🔧 [3/6] Installing Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    sudo apt-get install -y docker-compose-plugin
else
    echo "Docker Compose already installed"
fi

# ── 4. Clone/pull repo ──
echo ""
echo "📥 [4/6] Setting up UdaanSetu..."
APP_DIR="/opt/udaansetu"
if [ ! -d "$APP_DIR" ]; then
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
fi

# If git repo exists, pull. Otherwise assume files are already there.
if [ -d "$APP_DIR/.git" ]; then
    cd $APP_DIR
    git pull origin 26136
else
    cd $APP_DIR
    echo "Files should be in $APP_DIR — copy them with:"
    echo "  scp -r /path/to/UdaanSetu/* ubuntu@YOUR_IP:/opt/udaansetu/"
fi

# ── 5. Create .env ──
echo ""
echo "🔐 [5/6] Configuring environment..."
if [ ! -f "$APP_DIR/.env" ]; then
    SECRET_KEY=$(openssl rand -hex 32)
    DB_PASS=$(openssl rand -hex 16)
    PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)

    cat > "$APP_DIR/.env" << EOF
# ── Database ──
POSTGRES_DB=udaansetu
POSTGRES_USER=udaansetu
POSTGRES_PASSWORD=${DB_PASS}

# ── Backend ──
DATABASE_URL=postgresql+psycopg://udaansetu:${DB_PASS}@db:5432/udaansetu
SECRET_KEY=${SECRET_KEY}
OLLAMA_ENABLED=false
CORS_ORIGINS=http://${PUBLIC_IP},http://localhost:3000
JWT_EXPIRY_HOURS=12

# ── Frontend ──
NEXT_PUBLIC_API_URL=http://${PUBLIC_IP}
EOF

    echo "✅ .env created with auto-generated secrets"
    echo "   Public IP detected: ${PUBLIC_IP}"
else
    echo ".env already exists — skipping"
fi

# ── 6. Build and start ──
echo ""
echo "🔨 [6/6] Building and starting services..."
cd $APP_DIR
docker compose -f docker-compose.prod.yml up -d --build

# ── Seed database ──
echo ""
echo "🌱 Seeding database..."
docker compose -f docker-compose.prod.yml exec -T backend python -c "from app.seed import seed; seed()"

# ── Done ──
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com)
echo ""
echo "════════════════════════════════════════════════"
echo "✅ Deployment Complete!"
echo "════════════════════════════════════════════════"
echo ""
echo "🌐 Frontend:  http://${PUBLIC_IP}"
echo "📚 API Docs:  http://${PUBLIC_IP}/docs"
echo "🔑 Login:     admin@udaansetu.gov.in / Admin@123"
echo ""
echo "📝 Useful commands:"
echo "   docker compose -f docker-compose.prod.yml logs -f     # View logs"
echo "   docker compose -f docker-compose.prod.yml ps          # Status"
echo "   docker compose -f docker-compose.prod.yml restart     # Restart"
echo "   docker compose -f docker-compose.prod.yml down        # Stop"
echo "   docker compose -f docker-compose.prod.yml up -d --build  # Rebuild"
echo ""
echo "🔒 To enable HTTPS:"
echo "   sudo apt-get install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d YOUR_DOMAIN"
