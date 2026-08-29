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

# ---- Backend build (gera o Prisma Client) ----
FROM node:20-alpine AS backend-builder
WORKDIR /app
# Alpine não vem com OpenSSL por padrão — sem isso o "prisma generate" baixa
# o engine errado para o musl do Alpine.
RUN apk add --no-cache openssl
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npx prisma generate

# ---- Backend runtime ----
# O build estrito (tsc) do backend ainda tem erros de tipo e de resolução de
# módulos ESM sem extensão ".js" (incompatível com "moduleResolution": "NodeNext").
# Até isso ser corrigido no código-fonte, rodamos via "tsx" (o mesmo executor
# que o "npm run dev" já usa) em vez de compilar com tsc.
FROM node:20-alpine AS backend-runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
COPY backend/package*.json ./
# "tsx" (usado pra rodar o servidor) está em devDependencies, então instala tudo.
RUN npm ci
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/node_modules/@prisma ./node_modules/@prisma
COPY backend/ .
EXPOSE 3333
CMD ["npx", "tsx", "src/server.ts"]

# ---- Frontend runtime (nginx) ----
FROM nginx:alpine AS frontend-runner
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
