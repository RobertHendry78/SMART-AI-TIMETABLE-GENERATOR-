# Docker Containerization - Smart AI Timetable Generator

This directory contains container definitions and orchestration scripts for the Smart AI Timetable Generator system.

## Files
- `Dockerfile`: Multi-stage build (React Vite frontend compilation + Node.js Express production server)
- `docker-compose.yml`: Automated deployment with healthchecks and environment configs
- `.dockerignore`: Excluded directories (node_modules, local caches, logs)

## Quick Run
From the project root:
```bash
docker compose up -d
```
Or from the `docker/` folder:
```bash
docker compose -f docker-compose.yml up -d
```

## Exposed Services
- **Web Interface & REST API:** `http://localhost:5000`
- **n8n Automation Engine:** `http://localhost:5678`
