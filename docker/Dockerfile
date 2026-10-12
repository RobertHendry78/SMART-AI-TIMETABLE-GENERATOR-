# ==============================================================================
# Smart AI Timetable Generator - Multi-Stage Production Dockerfile
# ==============================================================================

# Stage 1: Build Frontend (React + Vite + TypeScript)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Server (Node.js Express + Supabase + n8n automation)
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache python3 py3-pip make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY backend ./backend
COPY database ./database
COPY automation ./automation
COPY .env.example ./.env

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
EXPOSE 5678

CMD ["node", "backend/server.js"]
