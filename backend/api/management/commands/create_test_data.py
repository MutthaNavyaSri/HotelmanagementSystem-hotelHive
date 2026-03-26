from django.core.management.base import BaseCommand
from api.models import Room


class Command(BaseCommand):
    help = 'Create test room data for development and testing'

    def handle(self, *args, **options):
        # Test rooms data
        rooms_data = [
            {"title": "Deluxe Suite", "description": "Luxury room with ocean view", "room_type": "deluxe", "price_per_night": 150, "max_guests": 2, "location": "Bangalore Downtown"},
            {"title": "Standard Double Room", "description": "Comfortable room with WiFi", "room_type": "double", "price_per_night": 80, "max_guests": 2, "location": "Bangalore East"},
            {"title": "Family Suite", "description": "Spacious room for families", "room_type": "suite", "price_per_night": 200, "max_guests": 4, "location": "Bangalore Whitefield"},
            {"title": "Budget Single Room", "description": "Economy room", "room_type": "single", "price_per_night": 50, "max_guests": 1, "location": "Bangalore Airport"},
        ]

        # Clear existing rooms first
        Room.objects.all().delete()
        self.stdout.write(self.style.WARNING('Cleared existing rooms'))

        # Create new rooms
        for data in rooms_data:
            room = Room.objects.create(**data)
            self.stdout.write(self.style.SUCCESS(f'✅ Created: {room.title} ({room.room_type}) - ${room.price_per_night}/night'))

        total = Room.objects.count()
        self.stdout.write(self.style.SUCCESS(f'\n📊 Total rooms in database: {total}'))
