from api.models import Room, Review, Booking
from django.db.models import Count, Avg, F, Q
from datetime import timedelta
from django.utils import timezone


def get_recommendations(limit=6):
    """
    Get recommended rooms based on:
    - Popularity (number of bookings)
    - Rating (average rating)
    
    Strategy: Order by rating count (descending) then total rating (descending)
    This ensures popular, highly-rated rooms appear first
    """
    rooms = Room.objects.annotate(
        booking_count=Count('bookings')
    ).order_by(
        '-rating_count',  # More reviews first
        '-total_rating',  # Higher rating first
        '-booking_count'  # More bookings first
    )[:limit]
    
    return rooms


def get_popular_rooms(limit=6):
    """
    Get popular rooms by booking count
    """
    rooms = Room.objects.annotate(
        booking_count=Count('bookings')
    ).order_by('-booking_count')[:limit]
    
    return rooms


def get_top_rated_rooms(limit=6):
    """
    Get top-rated rooms (with at least one review)
    """
    rooms = Room.objects.filter(
        rating_count__gt=0
    ).order_by('-total_rating', '-rating_count')[:limit]
    
    return rooms


def generate_transaction_id():
    """
    Generate a fake transaction ID for payment simulation
    Format: TXN-{timestamp}-{random_string}
    """
    import random
    import string
    from datetime import datetime
    
    timestamp = int(datetime.now().timestamp())
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    return f"TXN-{timestamp}-{random_str}"


def get_room_availability(room_id, check_in, check_out):
    """
    Check if a room is available for the given dates
    Returns:
    - True: Room is available
    - False: Room is not available (has conflicting bookings)
    """
    conflicting_bookings = Booking.objects.filter(
        room_id=room_id,
        status__in=['pending', 'confirmed', 'pending_verification'],
        check_in__lt=check_out,
        check_out__gt=check_in
    )
    
    return not conflicting_bookings.exists()


def get_user_booking_history(user, limit=10):
    """
    Get user's booking history (recent bookings first)
    """
    bookings = Booking.objects.filter(
        user=user
    ).order_by('-created_at')[:limit]
    
    return bookings


def mark_completed_bookings():
    """
    Mark bookings as 'completed' if check-out date has passed
    This should be run as a scheduled task
    """
    today = timezone.now().date()
    
    completed_bookings = Booking.objects.filter(
        status='confirmed',
        check_out__lt=today
    ).update(status='completed')
    
    return completed_bookings


def get_admin_dashboard_stats():
    """
    Get stats for admin dashboard
    Returns:
    - total_bookings: Total number of bookings
    - pending_verifications: Number of pending payment verifications
    - today_bookings: Bookings with check-in today
    - revenue: Total revenue from confirmed bookings
    """
    total_bookings = Booking.objects.count()
    pending_verifications = Booking.objects.filter(status='pending_verification').count()
    
    today = timezone.now().date()
    today_bookings = Booking.objects.filter(check_in=today).count()
    
    # Calculate revenue from completed and confirmed bookings
    from django.db.models import Sum
    revenue = Booking.objects.filter(
        status__in=['completed', 'confirmed']
    ).aggregate(total=Sum('total_price'))['total'] or 0
    
    # Recent payments awaiting verification
    recent_payments = Booking.objects.filter(
        status='pending_verification'
    ).order_by('-created_at')[:5]
    
    return {
        'total_bookings': total_bookings,
        'pending_verifications': pending_verifications,
        'today_bookings': today_bookings,
        'revenue': revenue,
        'recent_payments': recent_payments
    }


def get_unverified_payments(limit=10):
    """
    Get payments awaiting admin verification
    """
    from api.models import Payment
    
    unverified = Payment.objects.filter(
        status='pending_verification'
    ).order_by('-created_at')[:limit]
    
    return unverified
