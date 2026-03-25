from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser as DRFIsAdminUser
from django.core.files.storage import default_storage
from django.utils import timezone
from django.contrib.auth.models import User
import json

from api.models import UserProfile, Room, Image, Booking, Payment, Review
from api.serializers import (
    UserProfileSerializer, RoomListSerializer, RoomDetailSerializer, RoomCreateUpdateSerializer,
    BookingListSerializer, BookingDetailSerializer, BookingCreateSerializer,
    PaymentSerializer, PaymentCreateSerializer, ReviewSerializer, ReviewCreateSerializer,
    AdminPaymentVerificationSerializer
)
from api.permissions import IsAdminUser, IsOwner, IsAdminOrReadOnly, IsAuthenticated as IsAuthenticatedPerm
from api.filters import RoomFilter
from api.utils import get_recommendations, generate_transaction_id, get_admin_dashboard_stats, get_unverified_payments
from api.authentication import generate_jwt_token


class AuthViewSet(viewsets.ViewSet):
    """Authentication endpoints"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'], url_path='firebase-login')
    def firebase_login(self, request):
        """
        Firebase login endpoint
        Body: { firebase_token, email }
        """
        email = request.data.get('email')
        firebase_uid = request.data.get('firebase_uid')
        
        if not email or not firebase_uid:
            return Response({'error': 'email and firebase_uid required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Try to get existing user by email
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Create new user with unique username
            username = email.split('@')[0]
            counter = 1
            original_username = username
            
            # Ensure username is unique
            while User.objects.filter(username=username).exists():
                username = f"{original_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password=firebase_uid  # Use firebase_uid as temporary password
            )
        
        # Create or update profile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.firebase_uid = firebase_uid
        profile.save()
        
        # Generate JWT token
        token = generate_jwt_token(user)
        
        return Response({
            'success': True,
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'is_admin': profile.is_admin
            }
        })
    
    @action(detail=False, methods=['post'])
    def signup(self, request):
        """Create new user"""
        email = request.data.get('email')
        password = request.data.get('password')
        firebase_uid = request.data.get('firebase_uid')
        
        if not email or not firebase_uid:
            return Response({'error': 'email and firebase_uid required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user with unique username
        username = email.split('@')[0]
        counter = 1
        original_username = username
        
        # Ensure username is unique
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        
        # Create user
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password or firebase_uid
        )
        
        # Create profile
        profile = UserProfile.objects.create(user=user, firebase_uid=firebase_uid)
        
        # Generate JWT token
        token = generate_jwt_token(user)
        
        return Response({
            'success': True,
            'token': token,
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'is_admin': profile.is_admin
            }
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user info"""
        profile = request.user.profile
        return Response({
            'id': request.user.id,
            'email': request.user.email,
            'username': request.user.username,
            'is_admin': profile.is_admin,
            'phone_number': profile.phone_number,
            'profile_image': profile.profile_image.url if profile.profile_image else None
        })
    
    @action(detail=False, methods=['get'])
    def debug_auth(self, request):
        """Debug: Show authentication status"""
        if request.user.is_authenticated:
            return Response({
                'authenticated': True,
                'user_id': request.user.id,
                'email': request.user.email,
                'username': request.user.username,
                'bookings_count': Booking.objects.filter(user=request.user).count(),
                'token_header': request.META.get('HTTP_AUTHORIZATION', 'No token sent')
            })
        else:
            return Response({
                'authenticated': False,
                'error': 'Not authenticated',
                'token_header': request.META.get('HTTP_AUTHORIZATION', 'No token sent')
            }, status=status.HTTP_401_UNAUTHORIZED)


class RoomViewSet(viewsets.ModelViewSet):
    """Room endpoints"""
    queryset = Room.objects.all().order_by('-created_at')
    filterset_class = RoomFilter
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        """Get all rooms ordered by creation date (newest first)"""
        return Room.objects.all().select_related('created_by').prefetch_related('images').order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RoomDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return RoomCreateUpdateSerializer
        return RoomListSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """Get recommended rooms"""
        rooms = get_recommendations(limit=6)
        serializer = RoomListSerializer(rooms, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """
        Check room availability for date range
        Query params: check_in, check_out (YYYY-MM-DD format)
        """
        room = self.get_object()
        check_in_str = request.query_params.get('check_in')
        check_out_str = request.query_params.get('check_out')
        
        if not check_in_str or not check_out_str:
            return Response({'error': 'check_in and check_out required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from datetime import datetime
        check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
        check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
        
        # Check for conflicting bookings
        conflicting = Booking.objects.filter(
            room=room,
            status__in=['pending', 'confirmed', 'pending_verification'],
            check_in__lt=check_out,
            check_out__gt=check_in
        ).exists()
        
        return Response({
            'available': not conflicting,
            'room_id': room.id,
            'check_in': check_in_str,
            'check_out': check_out_str
        })
    
    @action(detail=True, methods=['post'])
    def upload_images(self, request, pk=None):
        """Upload multiple images for a room"""
        permission_classes = [IsAdminUser]
        room = self.get_object()
        
        images = request.FILES.getlist('images')
        if not images:
            return Response({'error': 'No images provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        for image in images:
            Image.objects.create(room=room, image=image)
        
        return Response({'success': True, 'image_count': len(images)})


class BookingViewSet(viewsets.ModelViewSet):
    """Booking endpoints"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Admins see all bookings, users see their own
        if hasattr(user, 'profile') and user.profile.is_admin:
            return Booking.objects.all()
        return Booking.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BookingDetailSerializer
        elif self.action == 'create':
            return BookingCreateSerializer
        return BookingListSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        """Allow PATCH updates for status (admin only)"""
        booking = self.get_object()
        
        # Only admins can update booking status
        if not (hasattr(request.user, 'profile') and request.user.profile.is_admin):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Only allow status updates
        if 'status' in request.data:
            new_status = request.data.get('status')
            
            # Validate status
            valid_statuses = ['pending', 'pending_verification', 'confirmed', 'completed', 'cancelled']
            if new_status not in valid_statuses:
                return Response({'error': f'Invalid status. Must be one of {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)
            
            booking.status = new_status
            booking.save()
            
            serializer = BookingDetailSerializer(booking)
            return Response(serializer.data)
        
        # For other fields, deny update
        return Response({'error': 'Only status field can be updated'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        # Check permissions
        if booking.user != request.user and not request.user.profile.is_admin:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Can only cancel pending or pending_verification
        if booking.status not in ['pending', 'pending_verification']:
            return Response({'error': f'Cannot cancel booking with status {booking.status}'}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'cancelled'
        booking.save()
        
        return Response({'success': True, 'status': 'Booking cancelled'})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def admin_list(self, request):
        """Admin view of all bookings"""
        bookings = Booking.objects.all().order_by('-created_at')
        serializer = BookingListSerializer(bookings, many=True, context={'request': request})
        return Response(serializer.data)


class PaymentViewSet(viewsets.ViewSet):
    """Payment endpoints"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def simulate(self, request):
        """
        Simulate payment and generate transaction ID
        Body: { booking_id, payment_method }
        """
        booking_id = request.data.get('booking_id')
        
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Generate fake transaction ID
        transaction_id = generate_transaction_id()
        
        return Response({
            'success': True,
            'transaction_id': transaction_id,
            'amount': str(booking.total_price),
            'booking_id': booking.booking_id,
            'hotel_name': booking.room.title
        })
    
    @action(detail=False, methods=['post'])
    def verify(self, request):
        """
        Submit payment proof
        Body: { booking_id, transaction_id, user_name, user_email, proof_screenshot (file) }
        """
        booking_id = request.data.get('booking_id')
        transaction_id = request.data.get('transaction_id')
        user_name = request.data.get('user_name')
        user_email = request.data.get('user_email')
        proof_screenshot = request.FILES.get('proof_screenshot')
        
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not proof_screenshot:
            return Response({'error': 'Screenshot required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update payment
        payment, created = Payment.objects.get_or_create(booking=booking)
        payment.transaction_id = transaction_id
        payment.amount = booking.total_price
        payment.user_name = user_name
        payment.user_email = user_email
        payment.proof_screenshot = proof_screenshot
        payment.status = 'pending_verification'
        payment.save()
        
        # Update booking status
        booking.status = 'pending_verification'
        booking.save()
        
        return Response({
            'success': True,
            'message': 'Payment proof submitted. Awaiting admin verification.',
            'transaction_id': transaction_id
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def status(self, request):
        """Get payment status for a booking"""
        booking_id = request.query_params.get('booking_id')
        
        try:
            payment = Payment.objects.get(booking_id=booking_id)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def admin_list(self, request):
        """Admin: List all unverified payments"""
        payments = Payment.objects.filter(
            status='pending_verification'
        ).order_by('-created_at')
        serializer = AdminPaymentVerificationSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def admin_approve(self, request, pk=None):
        """Admin: Approve payment"""
        try:
            payment = Payment.objects.get(id=pk)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        payment.status = 'approved'
        payment.verified_at = timezone.now()
        payment.verified_by = request.user
        payment.save()
        
        # Update booking status to confirmed
        payment.booking.status = 'confirmed'
        payment.booking.save()
        
        return Response({'success': True, 'message': 'Payment approved'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def admin_reject(self, request, pk=None):
        """Admin: Reject payment"""
        try:
            payment = Payment.objects.get(id=pk)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        rejection_reason = request.data.get('rejection_reason', '')
        
        payment.status = 'rejected'
        payment.verified_at = timezone.now()
        payment.verified_by = request.user
        payment.rejection_reason = rejection_reason
        payment.save()
        
        # Update booking status back to pending
        payment.booking.status = 'pending'
        payment.booking.save()
        
        return Response({'success': True, 'message': 'Payment rejected'})


class ReviewViewSet(viewsets.ModelViewSet):
    """Review endpoints"""
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room')
        if room_id:
            return Review.objects.filter(room_id=room_id)
        return Review.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['delete'], permission_classes=[IsAdminUser])
    def admin_delete(self, request, pk=None):
        """Admin: Delete a review"""
        try:
            review = Review.objects.get(id=pk)
            review.delete()
            return Response({'success': True, 'message': 'Review deleted'})
        except Review.DoesNotExist:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminDashboardViewSet(viewsets.ViewSet):
    """Admin dashboard endpoints"""
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get admin dashboard statistics"""
        stats = get_admin_dashboard_stats()
        
        # Convert queryset to list of serialized data
        recent_payments = BookingListSerializer(
            stats['recent_payments'],
            many=True,
            context={'request': request}
        ).data
        
        return Response({
            'total_bookings': stats['total_bookings'],
            'pending_verifications': stats['pending_verifications'],
            'today_bookings': stats['today_bookings'],
            'revenue': str(stats['revenue']),
            'recent_payments': recent_payments
        })


class ChatViewSet(viewsets.ViewSet):
    """Smart Chat Bot endpoint"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """
        Smart chat endpoint
        Body: { message: str }
        Returns: { response, intent, suggestions, rooms (optional), booking (optional) }
        """
        from api.chat_engine import ChatEngine
        from api.serializers import ChatMessageSerializer, ChatResponseSerializer
        
        # Validate input
        serializer = ChatMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user_message = serializer.validated_data.get('message')
        
        # Get authenticated user if available
        user = request.user if request.user.is_authenticated else None
        
        # Process message with chat engine
        chat_engine = ChatEngine(user=user)
        result = chat_engine.process_message(user_message)
        
        # Return response
        response_serializer = ChatResponseSerializer(result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

