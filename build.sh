#!/usr/bin/env bash
# Build script for Render deployment
# This script runs during the build phase on Render

set -o errexit  # Exit on error

echo "📦 Installing dependencies..."
npm install --production

echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "✅ Build completed successfully!"
