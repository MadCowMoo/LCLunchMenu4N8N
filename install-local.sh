#!/bin/bash

# This script automates the local installation of the LCLunchMenu4N8N custom node.
# It builds the project, links it globally, and then links it into the n8n custom nodes directory.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting local installation for LCLunchMenu4N8N..."

# Step 1: Build the project
echo "--> Building the project..."
npm run build

# Step 2: Link the project globally
echo "--> Linking the project globally..."
npm link

# Step 3: Create the n8n custom nodes directory
echo "--> Ensuring the n8n custom nodes directory exists..."
mkdir -p ~/.n8n/custom

# Step 4: Link the node into n8n
echo "--> Linking the node into the n8n custom directory..."
# The package name is taken from package.json
PACKAGE_NAME=$(node -p "require('./package.json').name")
(cd ~/.n8n/custom && npm link "$PACKAGE_NAME")

echo ""
echo "✅ Local installation complete!"
echo "Next step: Restart your n8n instance for the changes to take effect."
