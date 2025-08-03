#!/bin/bash
set -e

echo "Building for Vercel..."

# Install dependencies
npm ci

# Build the project
npm run build

echo "Build complete!"
