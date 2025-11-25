# Buy2Rent Apartment Admin - Backend

Django REST Framework backend for the Buy2Rent apartment management system.

## Features

- **Client Management**: Manage investors and internal clients
- **Apartment Management**: Track furnishing and renovation projects
- **Vendor Management**: Maintain vendor information and contacts
- **Product Management**: Comprehensive product tracking with status, payments, and delivery information
- **Delivery Tracking**: Monitor deliveries with status updates and proof photos
- **Payment Management**: Track payments with history and outstanding balances
- **Issue Management**: Handle product issues with AI communication logs
- **Activity Tracking**: Log all activities and AI notes for apartments

## API Endpoints

### Core Entities
- `/api/clients/` - Client management
- `/api/apartments/` - Apartment management
- `/api/vendors/` - Vendor management
- `/api/products/` - Product management
- `/api/deliveries/` - Delivery tracking
- `/api/payments/` - Payment management
- `/api/issues/` - Issue management
- `/api/activities/` - Activity logs

### Supporting Endpoints
- `/api/payment-history/` - Payment history records
- `/api/issue-photos/` - Issue photo management
- `/api/ai-communication-logs/` - AI communication logs
- `/api/ai-notes/` - AI notes for apartments
- `/api/manual-notes/` - Manual notes for apartments

## Setup Instructions

### Option 1: Automated Setup (Recommended)

**For Windows:**
```bash
# Run the automated setup script
activate_and_setup.bat
```

**For Linux/Mac:**
```bash
# Make script executable and run
chmod +x activate_and_setup.sh
./activate_and_setup.sh
```

**For Python script:**
```bash
# First activate your virtual environment, then:
python setup_with_venv.py
```

### Option 2: Manual Setup

### 1. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 4. Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Seed Sample Data
```bash
python manage.py seed_data
```

### 6. Run Development Server
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Documentation

### Interactive Documentation
- **Swagger UI**: `http://localhost:8000/api/docs/` - Interactive API testing interface
- **ReDoc**: `http://localhost:8000/api/redoc/` - Beautiful API documentation
- **Browsable API**: `http://localhost:8000/api/` - Django REST Framework interface
- **OpenAPI Schema**: `http://localhost:8000/api/schema/` - Raw OpenAPI 3.0 schema

### Testing APIs
1. Start the server: `python manage.py runserver`
2. Open Swagger UI: `http://localhost:8000/api/docs/`
3. Use "Try it out" buttons to test each endpoint
4. Authenticate using the login endpoint first for protected routes

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/` using your superuser credentials.

## Database Models

### Client
- Personal and contact information
- Account status and type (Investor/Internal)
- Notes and timestamps

### Apartment
- Project details and timeline
- Client relationship
- Progress tracking and status
- Designer assignment

### Vendor
- Company and contact information
- Website and communication details
- Notes for vendor management

### Product
- Comprehensive product information
- Pricing and payment tracking
- Delivery and issue management
- Status tracking throughout lifecycle

### Delivery
- Delivery scheduling and tracking
- Proof of delivery with photos
- Status updates and notes

### Payment
- Payment tracking with history
- Outstanding balance calculation
- Multiple payment methods support

### Issue
- Issue reporting and tracking
- AI communication logs
- Photo attachments
- Resolution status tracking

### Activity & Notes
- Activity logging for all operations
- AI-generated notes and communications
- Manual notes for apartments

## Development

### Adding New Features
1. Create new models in appropriate apps
2. Generate and run migrations
3. Create serializers for API representation
4. Add viewsets for API endpoints
5. Register in URL router
6. Add admin interface if needed

### Testing
```bash
python manage.py test
```

### Code Quality
The project follows Django best practices:
- Model-View-Serializer architecture
- RESTful API design
- Proper error handling
- Comprehensive filtering and search
- Pagination support
- CORS configuration for frontend integration
