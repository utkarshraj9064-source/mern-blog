# ---- Stage 1: build the React app with Vite ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# The backend URL is baked into the static bundle at build time
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Stage 2: serve the static files with nginx ----
FROM nginx:1.27-alpine

# The official nginx image runs envsubst on /etc/nginx/templates/*.template at startup,
# so nginx listens on $PORT (Cloud Run sets 8080; default below is 8080 too).
ENV PORT=8080
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
