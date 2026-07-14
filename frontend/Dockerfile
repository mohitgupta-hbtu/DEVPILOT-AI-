# Frontend build + static serve (alternative to Vercel)
# Multi-stage: build with Node, serve the dist/ output with Vite preview.
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS serve
WORKDIR /app
COPY --from=build /app /app
EXPOSE 3000
# Vite preview serves the built SPA; set the public API origin via VITE_API_URL at build time.
CMD ["sh", "-c", "npx vite preview --host 0.0.0.0 --port ${PORT:-3000}"]
