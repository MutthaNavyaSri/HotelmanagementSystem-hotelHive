from django_filters import rest_framework as filters
from api.models import Room


class RoomFilter(filters.FilterSet):
    """
    Filter for Room model
    Supports filtering by:
    - price_min: minimum price
    - price_max: maximum price
    - room_type: type of room
    - check_in: check-in date (for availability)
    - check_out: check-out date (for availability)
    """
    
    price_min = filters.NumberFilter(field_name='price_per_night', lookup_expr='gte')
    price_max = filters.NumberFilter(field_name='price_per_night', lookup_expr='lte')
    room_type = filters.ChoiceFilter(choices=Room.ROOM_TYPE_CHOICES)
    location = filters.CharFilter(field_name='location', lookup_expr='icontains')
    
    class Meta:
        model = Room
        fields = ['room_type', 'max_guests', 'location']
