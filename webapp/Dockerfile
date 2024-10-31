# Development stage
FROM node:20.12.0 AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
CMD ["npm", "run", "dev"]

# Production build stage
FROM node:20.12.0 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Production stage
FROM node:20.12.0 AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "server.js"]
