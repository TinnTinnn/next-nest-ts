FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# ติดตั้ง dependencies (รวม dev เพื่อให้ prisma ใช้งานได้)
RUN npm install

# ติดตั้ง Nest CLI สำหรับ build
RUN npm install -g @nestjs/cli

COPY . .

# สร้าง Prisma Client
RUN npx prisma generate

# Build NestJS app
RUN npm run build

# ให้สิทธิ์รัน entrypoint
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

# ใช้ entrypoint.sh ตอน container รันจริง
CMD ["./entrypoint.sh"]
