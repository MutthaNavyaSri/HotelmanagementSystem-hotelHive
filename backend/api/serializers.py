from rest_framework import serializers
from django.contrib.auth.models import User
from api.models import UserProfile, Room, Image, Booking, Payment, Review
from django.utils import timezone


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile"""
    email = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'username', 'firebase_uid', 'is_admin', 'phone_number', 'profile_image', 'created_at']
    
    def get_email(self, obj):
        return obj.user.email
    
    def get_username(self, obj):
        return obj.user.username


class ImageSerializer(serializers.ModelSerializer):
    """Serializer for Room Images"""
    class Meta:
        model = Image
        fields = ['id', 'image', 'uploaded_at']


class RoomListSerializer(serializers.ModelSerializer):
    """Serializer for Room Listing (minimal info)"""
    primary_image = serializers.SerializerMethodField()
    average_rating = serializers.FloatField()
    
    class Meta:
        model = Room
        fields = ['id', 'title', 'room_type', 'price_per_night', 'max_guests', 'primary_image', 'average_rating', 'rating_count']
    
    def get_primary_image(self, obj):
        """Get the first image of the room"""
        image = obj.images.first()
        if image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
            return image.image.url
        return None


class RoomDetailSerializer(serializers.ModelSerializer):
    """Serializer for Room Details (full info)"""
    images = ImageSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField()
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = [
            'id', 'title', 'description', 'room_type', 'price_per_night', 'max_guests',
            'amenities', 'images', 'average_rating', 'rating_count', 'available_from',
            'available_to', 'created_by_name', 'created_at', 'updated_at'
        ]
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None


class RoomCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for Creating/Updating Rooms"""
    images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False),
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Room
        fields = [
            'title', 'description', 'room_type', 'price_per_night', 'max_guests',
            'amenities', 'available_from', 'available_to', 'images'
        ]
    
    def create(self, validated_data):
        """Create room with images"""
        images = validated_data.pop('images', [])
        room = Room.objects.create(**validated_data)
        
        # Create image objects
        for image in images:
            Image.objects.create(room=room, image=image)
        
        return room


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Reviews"""
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'user_name', 'user_email', 'rating', 'comment', 'created_at']
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_user_email(self, obj):
        return obj.user.email


class BookingListSerializer(serializers.ModelSerializer):
    """Serializer for Booking Listing"""
    room_title = serializers.CharField(source='room.title', read_only=True)
    room_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = ['id', 'booking_id', 'room_title', 'room_image', 'check_in', 'check_out', 'guests', 'total_price', 'status', 'created_at']
    
    def get_room_image(self, obj):
        """Get room's primary image"""
        image = obj.room.images.first()
        if image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(image.image.url)
            return image.image.url
        return None


class BookingDetailSerializer(serializers.ModelSerializer):
    """Serializer for Booking Details"""
    room_title = serializers.CharField(source='room.title', read_only=True)
    room_price = serializers.DecimalField(source='room.price_per_night', max_digits=10, decimal_places=2, read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    nights = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'room_title', 'room_price', 'user_name', 'user_email',
            'check_in', 'check_out', 'guests', 'nights', 'total_price', 'status', 'created_at'
        ]
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    
    def get_user_email(self, obj):
        return obj.user.email
    
    def get_nights(self, obj):
        return obj.get_nights()


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for Creating Bookings"""
    room_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'room_id', 'check_in', 'check_out', 'guests', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']
    
    def validate(self, data):
        """Validate booking dates and room availability"""
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        room_id = self.initial_data.get('room_id')
        
        # Validate dates
        if check_in >= check_out:
            raise serializers.ValidationError("Check-out date must be after check-in date")
        
        if check_in < timezone.now().date():
            raise serializers.ValidationError("Check-in date cannot be in the past")
        
        # Validate room availability
        try:
            room = Room.objects.get(id=room_id)
            
            # Check if room has availability constraints
            if room.available_from and room.available_to:
                if check_in < room.available_from:
                    raise serializers.ValidationError(
                        f"Check-in date must be on or after {room.available_from.strftime('%B %d, %Y')}"
                    )
                
                if check_out > room.available_to:
                    raise serializers.ValidationError(
                        f"Check-out date must be on or before {room.available_to.strftime('%B %d, %Y')}"
                    )
        except Room.DoesNotExist:
            raise serializers.ValidationError("Room not found")
        
        return data
    
    def create(self, validated_data):
        """Create booking"""
        room_id = self.initial_data.get('room_id')
        room = Room.objects.get(id=room_id)
        user = self.context['request'].user
        
        booking = Booking.objects.create(
            user=user,
            room=room,
            check_in=validated_data['check_in'],
            check_out=validated_data['check_out'],
            guests=validated_data['guests']
        )
        
        return booking


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment"""
    booking_id = serializers.CharField(source='booking.booking_id', read_only=True)
    room_title = serializers.CharField(source='booking.room.title', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'booking_id', 'room_title', 'transaction_id', 'amount', 'status', 'proof_screenshot', 'user_name', 'user_email', 'created_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for Creating/Verifying Payment"""
    class Meta:
        model = Payment
        fields = ['proof_screenshot', 'user_name', 'user_email']
    
    def create(self, validated_data):
        """Create payment record for booking"""
        booking = self.context['booking']
        
        payment = Payment.objects.create(
            booking=booking,
            transaction_id=validated_data.get('transaction_id'),
            amount=booking.total_price,
            proof_screenshot=validated_data.get('proof_screenshot'),
            user_name=validated_data.get('user_name'),
            user_email=validated_data.get('user_email'),
        )
        
        return payment


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for Creating Reviews"""
    booking_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Review
        fields = ['booking_id', 'rating', 'comment']
    
    def validate(self, data):
        """Validate that booking is completed and no review exists"""
        booking_id = self.initial_data.get('booking_id')
        user = self.context['request'].user
        
        try:
            booking = Booking.objects.get(id=booking_id, user=user)
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found")
        
        # Check if booking is completed
        if booking.status != 'completed':
            raise serializers.ValidationError("You can only review completed bookings")
        
        # Check if review already exists
        if Review.objects.filter(booking=booking, user=user).exists():
            raise serializers.ValidationError("You have already reviewed this booking")
        
        return data
    
    def create(self, validated_data):
        """Create review"""
        booking_id = self.initial_data.get('booking_id')
        user = self.context['request'].user
        booking = Booking.objects.get(id=booking_id, user=user)
        
        review = Review.objects.create(
            booking=booking,
            user=user,
            room=booking.room,
            rating=validated_data['rating'],
            comment=validated_data['comment']
        )
        
        return review


class AdminPaymentVerificationSerializer(serializers.ModelSerializer):
    """Serializer for Admin Payment Verification"""
    booking_id = serializers.CharField(source='booking.booking_id', read_only=True)
    room_title = serializers.CharField(source='booking.room.title', read_only=True)
    user_email = serializers.CharField(source='booking.user.email', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'booking_id', 'room_title', 'user_email', 'transaction_id', 'amount', 'status', 'proof_screenshot', 'user_name', 'created_at']


class ChatMessageSerializer(serializers.Serializer):
    """Serializer for Chat Message Request"""
    message = serializers.CharField(max_length=1000, required=True)
    
    class Meta:
        fields = ['message']


class ChatResponseSerializer(serializers.Serializer):
    """Serializer for Chat Response"""
    response = serializers.CharField()
    intent = serializers.CharField()
    suggestions = serializers.ListField(default=list)
    rooms = serializers.ListField(default=list)
    booking = serializers.DictField(default=dict)
