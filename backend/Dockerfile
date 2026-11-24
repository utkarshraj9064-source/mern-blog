# ---- Backend image ----
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies (layer is cached unless package files change)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY src ./src

# Cloud Run injects PORT (8080); locally the default is 5000
ENV PORT=5000
EXPOSE 5000

# Run as the non-root "node" user that ships with the image
USER node

CMD ["node", "src/server.js"]
