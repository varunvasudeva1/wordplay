#!/bin/bash

# Install packages
npm install

# Build the project
npm run build

# Install the project as a package globally
sudo npm install -g .