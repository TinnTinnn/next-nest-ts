#!/bin/sh

echo "Running database migration..."
npx prisma migrate deploy

echo "Starting application..."
npm run start:prod
