
#!/bin/bash
set -e

echo "Building for Vercel deployment..."

# Install dependencies
echo "Installing root dependencies..."
npm install

# Build the client
echo "Building client..."
cd client
npm install
npm run build
cd ..

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install
cd ..

echo "Build complete! Ready for Vercel deployment."
