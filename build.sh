#!/bin/bash
set -e

echo "Building for Vercel deployment..."

# Build the client with Vite (outputs to dist/public)
echo "Building client..."
npx vite build

# Build the server with esbuild  
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Copy shared directory to dist
echo "Copying shared files..."
cp -r shared dist/

# Create server public directory and copy static assets for production
echo "Setting up static assets for production..."
mkdir -p dist/server/public
cp -r dist/public/* dist/server/public/

# Copy package.json to dist for dependencies
echo "Copying package files..."
cp package.json dist/
cp package-lock.json dist/ 2>/dev/null || true

echo "Build complete! Ready for Vercel deployment."
