#!/usr/bin/env bash
set -o errexit

echo "Installing dependencies..."
pip install -r backend/requirements.txt

echo "Collecting static files..."
python backend/manage.py collectstatic --no-input

echo "Applying database migrations..."
python backend/manage.py migrate

echo "Build complete."