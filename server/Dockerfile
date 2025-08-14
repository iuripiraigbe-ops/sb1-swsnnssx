FROM node:20-bullseye AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

FROM node:20-bullseye AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npx prisma generate

FROM node:20-bullseye AS runner

WORKDIR /app

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads

# Set production environment
ENV NODE_ENV=production

# Run migrations and start the application
CMD ["bash", "-lc", "npx prisma migrate deploy && node dist/index.js"]
