# === Stage 1: Build stage ===
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build NestJS project
RUN npm run build


# === Stage 2: Production stage ===
FROM node:18-alpine AS production

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built app and Prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Prisma needs schema.prisma at runtime (for some commands like migrate, etc.)
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma

# Set environment variables (ถ้ามี ENV จะอ่านจาก .env อยู่แล้ว)

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/main"]
