# ──────────────────────────────────────────────────────────────────────────────
# 🐳 Docker Quick Start Guide
# ──────────────────────────────────────────────────────────────────────────────

## 🚀 Quick Commands

### Development Mode (with hot-reload)
```bash
# Copy example env file
cp .env.example .env

# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### Production Mode
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

### Stop Services
```bash
# Stop gracefully
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis
```

### Access Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Redis**: localhost:6379

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# ── AI Provider ───────────────────────────────────────
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Azure OpenAI (optional, for production)
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# ── Database ──────────────────────────────────────────
DATABASE_URL=sqlite:///./dev.db
# For PostgreSQL (uncomment postgres in docker-compose.yml):
# DATABASE_URL=postgresql://ai_mentor:secure_password@postgres:5432/ai_career_mentor

# ── Auth ──────────────────────────────────────────────
SECRET_KEY=your_super_secret_jwt_key_minimum_32_chars
ACCESS_TOKEN_EXPIRE_MINUTES=10080
APP_ENV=development

# ── Google OAuth ──────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ── Redis (Upstash for production, local for dev) ─────
UPSTASH_REDIS_REST_URL=http://redis:6379
UPSTASH_REDIS_REST_TOKEN=

# ── CORS ──────────────────────────────────────────────
CORS_ORIGINS=http://localhost:3000

# ── Frontend ──────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📦 Docker Images

### Build Individual Services
```bash
# Backend only
docker build -t ai-career-mentor-backend ./backend

# Frontend only
docker build -t ai-career-mentor-frontend ./frontend
```

### Run Individual Containers
```bash
# Backend
docker run -d -p 8000:8000 --name backend ai-career-mentor-backend

# Frontend
docker run -d -p 3000:3000 --name frontend ai-career-mentor-frontend
```

---

## 🔍 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache
```

### Database migration issues
```bash
# Access backend container
docker-compose exec backend bash

# Run migrations manually
alembic upgrade head
```

### Port already in use
```bash
# Find process using port 8000 or 3000
lsof -i :8000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Clear all Docker resources
```bash
# Remove all containers, networks, and volumes
docker system prune -a --volumes
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                         │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌───────────────┐
│   Frontend    │         │    Backend    │
│   Next.js     │◄───────►│   FastAPI     │
│   Port: 3000  │         │   Port: 8000  │
└───────────────┘         └───────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │   Redis   │ │ Postgres  │ │   LLMs    │
            │  Rate Lim │ │  SQLite   │ │ Groq/Azure│
            │  Port:6379│ │           │ │           │
            └───────────┘ └───────────┘ └───────────┘
```

---

## 📝 Notes

- **Development**: Uses volume mounts for hot-reload
- **Production**: Uses multi-stage builds for minimal image size
- **Security**: Non-root users in containers
- **Health Checks**: Built-in health monitoring for all services
- **Networking**: Isolated Docker network for inter-service communication

For more information, see the main [README.md](../README.md)
