#!/bin/bash
# Build script for Vercel deployment

# Install dependencies
npm ci

# Build the client
npm run build

# Copy server files to output
mkdir -p dist/server
cp -r server/* dist/server/
cp -r shared dist/
cp package*.json dist/
