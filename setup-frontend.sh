#!/bin/bash

# Navigate to the frontend directory
cd frontend

# Install dependencies
echo "Installing dependencies..."
npm install

# Create Tailwind CSS configuration files if they don't exist
if [ ! -f tailwind.config.js ]; then
  echo "Creating Tailwind CSS configuration..."
  npx tailwindcss init
fi

if [ ! -f postcss.config.js ]; then
  echo "Creating PostCSS configuration..."
  echo "module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}" > postcss.config.js
fi

# Start the development server
echo "Starting the development server..."
npm start
