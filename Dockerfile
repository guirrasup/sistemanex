# Multi-stage Dockerfile for NEX Enterprise ERP (frontend Vite + backend Express/Prisma)

# ---- Frontend build ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN rm -rf backend
# Caminho relativo: o nginx serve o front e faz proxy de /api para o backend
# no mesmo domínio, então não precisa saber a URL/porta real do backend.
ENV VITE_API_URL=/api
RUN npm run build

# ---- Backend build (gera o Prisma Client e compila com tsc) ----
FROM node:20-alpine AS backend-builder
WORKDIR /app
# Alpine não vem com OpenSSL por padrão — sem isso o "prisma generate" baixa
# o engine errado para o musl do Alpine.
RUN apk add --no-cache openssl
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npx prisma generate
RUN npm run build

# ---- Backend runtime ----
# Roda o JavaScript compilado (dist/). O node_modules completo é mantido para
# que o Prisma CLI e o tsx continuem disponíveis para migrations e seeds via
# "docker compose exec backend npx prisma migrate deploy" / "npm run db:seed".
FROM node:20-alpine AS backend-runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY --from=backend-builder /app/package*.json ./
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/prisma ./prisma
EXPOSE 3333
CMD ["node", "dist/server.js"]

# ---- Frontend runtime (nginx) ----
FROM nginx:alpine AS frontend-runner
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
