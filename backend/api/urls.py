from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (
    AuthViewSet, RoomViewSet, BookingViewSet, PaymentViewSet, ReviewViewSet, AdminDashboardViewSet, ChatViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'admin/dashboard', AdminDashboardViewSet, basename='admin-dashboard')
router.register(r'chat', ChatViewSet, basename='chat')

app_name = 'api'

urlpatterns = [
    path('', include(router.urls)),
]
