#!/bin/bash

# TypeORM Database Setup Script
# This script helps initialize the database for the idfy-nest project

set -e

echo "🚀 TypeORM Database Setup for idfy-nest"
echo "========================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Database Configuration:"
echo "  - Host: ${DB_HOST:-localhost}"
echo "  - Port: ${DB_PORT:-5432}"
echo "  - Database: ${DB_NAME:-idfy_db}"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your database credentials"
echo "2. Make sure PostgreSQL is running"
echo "3. Run: npm run start:dev"
echo ""
echo "The database tables will be created automatically in development mode."
