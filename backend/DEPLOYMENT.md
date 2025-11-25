# Buy2Rent Backend Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

### 3. Database Setup & Seeding
Run the setup script:
```bash
python setup.py
```

Or manually:
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_data
```

### 4. Start Development Server
```bash
python manage.py runserver
```

## API Endpoints

### Authentication
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout  
- `POST /auth/signup/` - User registration
- `GET /auth/profile/` - User profile
- `GET /auth/check/` - Check authentication status

### Core APIs
- `GET|POST /api/clients/` - Client management
- `GET|POST /api/apartments/` - Apartment management
- `GET|POST /api/vendors/` - Vendor management
- `GET|POST /api/products/` - Product management
- `GET|POST /api/deliveries/` - Delivery tracking
- `GET|POST /api/payments/` - Payment management
- `GET|POST /api/issues/` - Issue management
- `GET|POST /api/activities/` - Activity logging

### Admin Interface
- `/admin/` - Django admin interface

## Default Credentials
- **Admin User**: admin / admin123
- **API Access**: Available at `http://localhost:8000/api/`

## Frontend Integration
The backend is configured with CORS to work with the React frontend running on:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

## Database Models

### Core Entities
1. **Client** - Customer information and contact details
2. **Apartment** - Project tracking with progress and status
3. **Vendor** - Supplier information and contacts
4. **Product** - Comprehensive product management with pricing, delivery, and issues
5. **Delivery** - Delivery tracking with photos and status updates
6. **Payment** - Payment tracking with history and outstanding balances
7. **Issue** - Issue management with AI communication logs
8. **Activity** - Activity logging for all operations

### Features
- ✅ Full CRUD operations for all entities
- ✅ Advanced filtering and search
- ✅ Pagination support
- ✅ Authentication and permissions
- ✅ CORS configuration for frontend
- ✅ Admin interface
- ✅ Sample data seeding
- ✅ API documentation via browsable API

## Production Deployment

### Environment Variables
```
SECRET_KEY=your-production-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:pass@host:port/dbname
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### Database
For production, use PostgreSQL:
```bash
pip install psycopg2-binary
```

### Static Files
```bash
python manage.py collectstatic
```

### WSGI Server
```bash
gunicorn config.wsgi:application
```

## Troubleshooting

### Common Issues
1. **Import Errors**: Ensure all apps are in `INSTALLED_APPS`
2. **Database Errors**: Run migrations with `python manage.py migrate`
3. **CORS Issues**: Check `CORS_ALLOWED_ORIGINS` in settings
4. **Permission Errors**: Verify user authentication and permissions

### Development Tools
- Use `run_django.bat` for Windows command shortcuts
- Use `setup.py` for automated setup
- Check `/api/` for API overview and endpoints
