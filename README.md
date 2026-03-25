# Hotel Management System

A full-stack hotel booking and management platform built with **React**, **Django REST Framework**, **Firebase**, and **SQLite**.

## Features

### User Features
- ✅ Firebase Authentication (Email/Password + Google Sign-In)
- ✅ Browse and filter hotel rooms
- ✅ Check room availability
- ✅ Book rooms with date selection
- ✅ Simulated payment gateway (UPI, Card, Net Banking)
- ✅ Payment proof upload and verification
- ✅ Booking history and management
- ✅ Leave reviews on completed bookings
- ✅ Smart room recommendations (popular + top-rated)

### Admin Features
- ✅ Dashboard with booking statistics
- ✅ Room management (CRUD operations)
- ✅ Image uploads for rooms
- ✅ Payment verification and approval/rejection
- ✅ Booking status management
- ✅ Review moderation

### Technical Highlights
- Role-based access control (User/Admin)
- JWT token-based API authentication
- Availability checking (prevent double bookings)
- Pagination for listings
- Responsive design (mobile-first)
- Docker deployment support

---

## Project Structure

```
hotelmanagement/
├── backend/                    # Django REST Framework
│   ├── hotelmanagement/       # Project settings
│   ├── api/                    # Main app with models, views, serializers
│   ├── media/                  # User uploads (images, screenshots)
│   ├── db.sqlite3              # Development database
│   ├── requirements.txt         # Python dependencies
│   ├── manage.py               # Django CLI
│   ├── .env                    # Environment variables
│   └── Dockerfile              # Backend container
│
├── frontend/                   # React with Vite
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── context/            # Auth context
│   │   ├── hooks/              # Custom hooks
│   │   ├── config/             # Firebase config
│   │   └── utils/              # Utilities
│   ├── public/                 # Static assets
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   ├── .env                    # Environment variables
│   ├── Dockerfile              # Frontend container
│   └── nginx.conf              # Nginx configuration
│
├── docker-compose.yml          # Docker Compose setup
└── README.md                   # This file
```

---

## Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup (Development)

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create .env file** (copy from .env.example)
   ```bash
   cp .env.example .env
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser** (for admin panel)
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

Backend will run on `http://localhost:8000`

### Frontend Setup (Development)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file** (copy from .env.example)
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:5173`

---

## API Endpoints

### Authentication
```
POST   /api/auth/firebase-login/      → Firebase login
POST   /api/auth/signup/              → Create new user
GET    /api/auth/me/                  → Get current user
```

### Rooms
```
GET    /api/rooms/                    → List rooms (with filters)
GET    /api/rooms/{id}/               → Room details
GET    /api/rooms/{id}/availability/  → Check availability
GET    /api/rooms/recommendations/    → Recommended rooms
POST   /api/rooms/                    → Create room (admin)
PUT    /api/rooms/{id}/               → Update room (admin)
DELETE /api/rooms/{id}/               → Delete room (admin)
```

### Bookings
```
POST   /api/bookings/                 → Create booking
GET    /api/bookings/                 → Get user's bookings
GET    /api/bookings/{id}/            → Booking details
POST   /api/bookings/{id}/cancel/     → Cancel booking
```

### Payments
```
POST   /api/payments/simulate/        → Simulate payment
POST   /api/payments/verify/          → Verify payment (upload proof)
GET    /api/payments/status/          → Payment status
GET    /api/payments/admin_list/      → Admin: Unverified payments
POST   /api/payments/{id}/admin_approve/ → Admin: Approve payment
POST   /api/payments/{id}/admin_reject/  → Admin: Reject payment
```

### Reviews
```
POST   /api/reviews/                  → Create review
GET    /api/reviews/                  → Get reviews (with room filter)
DELETE /api/reviews/{id}/             → Delete own review
```

### Admin Dashboard
```
GET    /api/admin/dashboard/stats/    → Dashboard statistics
```

---

## Docker Deployment

### Build and Run with Docker Compose

1. **Ensure Docker and Docker Compose are installed**

2. **Build images**
   ```bash
   docker-compose build
   ```

3. **Run containers**
   ```bash
   docker-compose up
   ```

4. **Run migrations in container**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create superuser in container**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

Services will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Admin: `http://localhost:8000/admin`

---

## Database Models

### User
- extends Django User
- firebase_uid (unique)
- is_admin (boolean)
- phone_number
- profile_image

### Room
- title, description
- room_type (Single/Double/Suite/Deluxe)
- price_per_night
- max_guests
- amenities (JSON)
- total_rating, rating_count
- created_by (Admin)

### Image
- room (ForeignKey)
- image file

### Booking
- user, room (ForeignKey)
- check_in, check_out (dates)
- guests
- total_price (calculated)
- status (Pending/Pending Verification/Confirmed/Completed/Cancelled)
- booking_id (unique)

### Payment
- booking (OneToOneField)
- transaction_id (fake, for simulation)
- amount
- status (Pending Verification/Approved/Rejected)
- proof_screenshot
- verified_by (Admin)

### Review
- booking, user, room (ForeignKey)
- rating (1-5)
- comment
- unique_together: (booking, user)

---

## Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
FIREBASE_PROJECT_ID=hotelmanagement-e4526
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=hotelmanagement-e4526.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hotelmanagement-e4526
```

---

## User Flows

### User Booking Flow
1. Sign up/Login with Firebase
2. Browse rooms with filters
3. Select room and check availability
4. Choose dates and guests
5. Create booking (status: Pending)
6. Simulate payment (generate fake transaction ID)
7. Upload payment proof
8. Wait for admin verification
9. On approval → Booking status: Confirmed
10. After checkout → Status: Completed
11. Leave review on completed booking

### Admin Verification Flow
1. Admin logs in
2. View dashboard with pending verifications
3. Check unverified payments
4. Verify screenshot and approve/reject
5. On approval → User booking status: Confirmed
6. On rejection → Booking status: Pending (user can re-try)

---

## Testing API with Postman/cURL

### Login
```bash
curl -X POST http://localhost:8000/api/auth/firebase-login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "firebase_uid": "firebase-uid-here"}'
```

### Get Rooms
```bash
curl http://localhost:8000/api/rooms/ \
  -H "Authorization: Bearer your-jwt-token"
```

### Create Booking
```bash
curl -X POST http://localhost:8000/api/bookings/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"room_id": 1, "check_in": "2024-04-01", "check_out": "2024-04-03", "guests": 2}'
```

---

## Troubleshooting

### Backend Issues

**Error: "Module venv could not be loaded"**
- Use absolute path: `c:\path\to\venv\Scripts\python.exe manage.py runserver`
- Or activate venv in separate shell first

**Error: "CORS errors"**
- Ensure CORS_ALLOWED_ORIGINS in .env includes frontend URL
- Check backend is running on correct port

**Error: "No such table"**
- Run migrations: `python manage.py migrate`

### Frontend Issues

**Error: "Cannot find module"**
- Run: `npm install`
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

**Error: "API not responding"**
- Start backend server first
- Check VITE_API_BASE_URL in .env

---

## Performance Notes

- Images are lazy-loaded
- API responses are paginated (12 per page)
- Debounced filter inputs (500ms)
- JWT tokens cached in localStorage
- Booking availability checked in real-time

---

## Security

- Firebase handles password security
- JWT tokens issued by Django (24-hour expiration)
- Server-side validation on all inputs
- CORS properly configured
- Media files served securely
- Admin actions require is_admin flag

---

## Future Enhancements

- Email notifications (booking confirmation, payment status)
- Advanced analytics dashboard
- Infinite scroll for room listings
- Real payment gateway integration
- Multi-currency support
- SMS notifications
- Automated testing suite

---

## License

MIT License - feel free to use for personal or commercial projects.

---

## Support

For issues or questions:
1. Check the API endpoint docs above
2. Review Django admin panel for data verification
3. Check browser console for frontend errors
4. Review backend logs for API errors

---

## Getting Started Quick Resume

**5-minute quick start:**

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuper user
python manage.py runserver

# Frontend (in new terminal)
cd frontend
npm install
npm run dev

# Visit http://localhost:5173
```

**Admin Access:** http://localhost:8000/admin

---

**Happy Booking! 🏨**
