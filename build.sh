#!/usr/bin/env bash
set -o errexit

echo "Installing dependencies..."
pip install -r backend/requirements.txt

echo "Collecting static files..."
python backend/manage.py collectstatic --no-input

echo "Applying database migrations..."
python backend/manage.py migrate

echo "Ensuring superuser exists..."
python backend/manage.py ensure_superuser

echo "Build complete."