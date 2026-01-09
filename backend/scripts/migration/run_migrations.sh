#!/bin/bash

echo "Creating migrations for new apps..."
python manage.py makemigrations dashboard --noinput
python manage.py makemigrations notifications --noinput
python manage.py makemigrations reports --noinput

echo "Running migrations..."
python manage.py migrate

echo "Migrations complete!"
