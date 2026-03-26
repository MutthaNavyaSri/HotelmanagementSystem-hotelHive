from django.contrib import admin
from api.models import UserProfile, Room, Image, Booking, Payment, Review


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['email', 'firebase_uid', 'is_admin', 'phone_number', 'created_at']
    list_filter = ['is_admin', 'created_at']
    search_fields = ['user__email', 'user__username', 'firebase_uid']
    readonly_fields = ['created_at', 'updated_at']
    
    def email(self, obj):
        return obj.user.email
    email.short_description = 'Email'


class ImageInline(admin.TabularInline):
    model = Image
    extra = 1
    fields = ['image', 'uploaded_at']
    readonly_fields = ['uploaded_at']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['title', 'room_type', 'location', 'price_per_night', 'max_guests', 'average_rating', 'rating_count', 'created_at']
    list_filter = ['room_type', 'location', 'created_at', 'rating_count']
    search_fields = ['title', 'description', 'location']
    readonly_fields = ['total_rating', 'rating_count', 'created_at', 'updated_at', 'average_rating']
    
    inlines = [ImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'room_type', 'location', 'max_guests')
        }),
        ('Pricing & Availability', {
            'fields': ('price_per_night', 'available_from', 'available_to')
        }),
        ('Amenities', {
            'fields': ('amenities',),
            'description': 'Enter amenities as JSON format, e.g., ["WiFi", "AC", "TV"]'
        }),
        ('Rating & Reviews', {
            'fields': ('total_rating', 'rating_count', 'average_rating'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def average_rating(self, obj):
        return obj.average_rating
    average_rating.short_description = 'Average Rating'


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_id', 'user_email', 'room_title', 'check_in', 'check_out', 'total_price', 'status', 'created_at']
    list_filter = ['status', 'created_at', 'room__room_type']
    search_fields = ['booking_id', 'user__email', 'room__title']
    readonly_fields = ['booking_id', 'total_price', 'created_at', 'updated_at']
    
    # Make status editable in the list view
    list_editable = ['status']
    
    fieldsets = (
        ('Booking Details', {
            'fields': ('booking_id', 'user', 'room')
        }),
        ('Dates & Guests', {
            'fields': ('check_in', 'check_out', 'guests')
        }),
        ('Status & Pricing', {
            'fields': ('status', 'total_price'),
            'description': 'Update the status here. Email will be sent automatically when status is changed to "Confirmed"'
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
    
    def room_title(self, obj):
        return obj.room.title
    room_title.short_description = 'Room'
    
    def has_change_permission(self, request, obj=None):
        """Allow all staff members to change bookings"""
        return request.user.is_staff
    
    def has_delete_permission(self, request, obj=None):
        """Allow all admin to delete bookings"""
        return request.user.is_staff


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'booking_id', 'amount', 'status', 'user_email', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['transaction_id', 'booking__booking_id', 'user_email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Payment Information', {
            'fields': ('booking', 'transaction_id', 'amount', 'status')
        }),
        ('User Information', {
            'fields': ('user_name', 'user_email')
        }),
        ('Proof & Verification', {
            'fields': ('proof_screenshot', 'verified_by', 'verified_at', 'rejection_reason')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def booking_id(self, obj):
        return obj.booking.booking_id
    booking_id.short_description = 'Booking ID'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'room_title', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['user__email', 'room__title', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Review Details', {
            'fields': ('booking', 'user', 'room', 'rating')
        }),
        ('Comment', {
            'fields': ('comment',),
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'
    
    def room_title(self, obj):
        return obj.room.title
    room_title.short_description = 'Room'


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ['room_title', 'image', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['room__title']
    readonly_fields = ['uploaded_at']
    
    def room_title(self, obj):
        return obj.room.title
    room_title.short_description = 'Room'

