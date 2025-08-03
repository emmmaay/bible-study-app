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

# Create public directory at server level (where serveStatic expects it)
echo "Setting up static assets for production..."
mkdir -p server/public
cp -r dist/public/* server/public/

echo "Build complete! Ready for Vercel deployment."
