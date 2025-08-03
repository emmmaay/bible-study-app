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

# Create the correct public directory structure for the server
echo "Setting up static assets for production..."
mkdir -p dist/server
cp -r dist/public dist/server/

echo "Build complete! Ready for Vercel deployment."
