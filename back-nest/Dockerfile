FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# ติดตั้งทุก dependencies รวม dev
RUN npm install

# ติดตั้ง Nest CLI เพื่อให้ nest build ทำงานได้
RUN npm install -g @nestjs/cli

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build app
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
