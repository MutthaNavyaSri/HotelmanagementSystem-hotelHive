"""
Smart Rule-Based Chat Engine for Hotel Management
Handles intent recognition and generates intelligent responses
"""

from django.utils import timezone
from datetime import datetime, timedelta
from api.models import Room, Booking
import re


class ChatEngine:
    """Rule-based chatbot engine with intent recognition"""

    def __init__(self, user=None):
        self.user = user
        self.intent = None
        self.entities = {}

    def process_message(self, user_message):
        """
        Process user message and return bot response
        
        Args:
            user_message (str): User's input message
            
        Returns:
            dict: { 'response': str, 'intent': str, 'suggestions': list }
        """
        if not user_message or not user_message.strip():
            return {
                'response': "Hello! 👋 How can I help you today? I can help you:\n• 🔍 Find available rooms\n• 📅 Book a room\n• 📊 Check your booking status\n• 💬 Answer questions about our hotel",
                'intent': 'greeting',
                'suggestions': ['Find rooms', 'My bookings', 'Hotel info']
            }

        user_message = user_message.lower().strip()

        # Intent recognition
        if self._is_room_search(user_message):
            return self._handle_room_search(user_message)
        
        if self._is_booking_status(user_message):
            return self._handle_booking_status(user_message)
        
        if self._is_booking_inquiry(user_message):
            return self._handle_booking_inquiry(user_message)
        
        if self._is_greeting(user_message):
            return self._handle_greeting()
        
        if self._is_hotel_info(user_message):
            return self._handle_hotel_info(user_message)
        
        # Default: FAQ fallback
        return self._handle_faq(user_message)

    # ==================== Intent Recognition ====================

    def _is_room_search(self, message):
        """Detect room search intent"""
        keywords = ['room', 'available', 'book', 'stay', 'night', 'price', 'guest', 'person']
        date_patterns = [
            r'\d{1,2}[-/]\d{1,2}',  # 25-03, 25/03
            r'(march|april|may|june|july|august|september|october|november|december)',
            r'(tomorrow|next week|this weekend|today)'
        ]
        
        has_keyword = any(kw in message for kw in keywords)
        has_date = any(re.search(pattern, message) for pattern in date_patterns)
        
        return has_keyword and (has_date or 'room' in message or 'book' in message)

    def _is_booking_status(self, message):
        """Detect booking status inquiry"""
        keywords = ['booking', 'reservation', 'status', 'my booking', 'order', '#']
        return any(kw in message for kw in keywords) and self.user

    def _is_booking_inquiry(self, message):
        """Detect booking inquiry"""
        keywords = ['how to book', 'book', 'reserve', 'reservation process']
        return any(kw in message for kw in keywords)

    def _is_greeting(self, message):
        """Detect greeting"""
        greetings = ['hello', 'hi', 'hey', 'greetings', 'hola', 'namaste']
        return any(greeting in message for greeting in greetings)

    def _is_hotel_info(self, message):
        """Detect hotel information inquiry"""
        keywords = ['amenities', 'facilities', 'rules', 'policy', 'checkin', 'checkout', 'parking', 'wifi']
        return any(kw in message for kw in keywords)

    # ==================== Intent Handlers ====================

    def _handle_room_search(self, message):
        """Handle room search requests"""
        try:
            # Extract check-in and check-out dates
            check_in = self._extract_date(message, 'check.?in|from|start')
            check_out = self._extract_date(message, 'check.?out|to|end', offset_days=1)

            # Extract price range
            price_max = self._extract_price(message)

            # Extract guest count
            guests = self._extract_guests(message)

            # Search rooms
            available_rooms = self._search_available_rooms(check_in, check_out, price_max)

            if check_in and check_out:
                date_str = f"{check_in.strftime('%b %d')} to {check_out.strftime('%b %d')}"
            else:
                date_str = "your desired dates"

            if available_rooms:
                response = f"✨ Great! I found {len(available_rooms)} available rooms for {date_str}"
                if price_max:
                    response += f" under ₹{price_max}/night"
                if guests:
                    response += f" for {guests} guest{'s' if guests > 1 else ''}."
                
                response += "\n\nTop options:\n"
                for room in available_rooms[:3]:
                    response += f"• {room['title']} - ₹{room['price_per_night']}/night ({room['room_type']})\n"
                
                response += "\nWould you like to book one of these rooms? 🏨"

                return {
                    'response': response,
                    'intent': 'room_search',
                    'suggestions': ['Book now', 'Change dates', 'See more rooms'],
                    'rooms': available_rooms[:3]
                }
            else:
                return {
                    'response': f"Sorry, no rooms available for {date_str}. 😔\n\nWould you like to:\n• Check different dates\n• Browse all rooms\n• Contact our support team",
                    'intent': 'room_search',
                    'suggestions': ['Different dates', 'Browse rooms', 'Contact support']
                }

        except Exception as e:
            return {
                'response': f"I can help you find rooms! Please provide:\n• Check-in and check-out dates\n• Your budget\n• Number of guests\n\nExample: 'I need a room for 2 people from March 25 to 28, under ₹5000'",
                'intent': 'room_search',
                'suggestions': ['Help with booking', 'Browse all rooms']
            }

    def _handle_booking_status(self, message):
        """Handle booking status inquiries"""
        if not self.user:
            return {
                'response': "To check your booking status, please log in first. 🔐",
                'intent': 'booking_status',
                'suggestions': ['Login', 'Browse rooms']
            }

        try:
            # Extract booking ID if provided
            booking_id_match = re.search(r'#?(\d+)', message)
            
            bookings = Booking.objects.filter(user=self.user).order_by('-created_at')
            
            if not bookings.exists():
                return {
                    'response': "You haven't made any bookings yet. 😊\n\nBrowse our beautiful rooms and book your next stay! 🏨",
                    'intent': 'booking_status',
                    'suggestions': ['Browse rooms', 'Find available rooms']
                }

            if booking_id_match:
                booking_id = int(booking_id_match.group(1))
                booking = bookings.filter(id=booking_id).first()
            else:
                booking = bookings.first()

            if booking:
                check_in = booking.check_in.strftime('%B %d, %Y')
                check_out = booking.check_out.strftime('%B %d, %Y')
                status = booking.status.replace('_', ' ').title()

                response = f"📋 Booking #{booking.id}\n\n"
                response += f"Room: {booking.room.title}\n"
                response += f"Check-in: {check_in}\n"
                response += f"Check-out: {check_out}\n"
                response += f"Guests: {booking.guests}\n"
                response += f"Status: {status} ✓\n"
                response += f"Total: ₹{booking.total_price}\n\n"

                if booking.status == 'pending':
                    response += "⏳ Your booking is pending payment. Complete payment to confirm."
                elif booking.status == 'confirmed':
                    response += "✅ Your booking is confirmed! Get ready for an amazing stay!"
                elif booking.status == 'completed':
                    response += "🎉 Booking completed! Thanks for staying with us!"
                elif booking.status == 'cancelled':
                    response += "❌ This booking has been cancelled."

                return {
                    'response': response,
                    'intent': 'booking_status',
                    'suggestions': ['View all bookings', 'Browse rooms', 'Contact support'],
                    'booking': {
                        'id': booking.id,
                        'room': booking.room.title,
                        'status': booking.status,
                        'check_in': check_in,
                        'check_out': check_out
                    }
                }
            else:
                return {
                    'response': "Booking not found. Here are your recent bookings:\n\n" + self._format_bookings_list(bookings),
                    'intent': 'booking_status',
                    'suggestions': ['View all', 'Browse rooms']
                }

        except Exception as e:
            return {
                'response': f"I can help you check your booking! Please provide your booking ID or ask 'What's my booking status?'",
                'intent': 'booking_status',
                'suggestions': ['My bookings', 'Help']
            }

    def _handle_booking_inquiry(self, message):
        """Handle 'how to book' inquiries"""
        response = """📅 **How to Book a Room:**

1️⃣ **Browse Rooms** - Go to our Rooms page
2️⃣ **Select Dates** - Choose your check-in and check-out dates
3️⃣ **Click Reserve** - Click "Reserve Now" button
4️⃣ **Enter Details** - Select number of guests
5️⃣ **Login/Signup** - Create account or login
6️⃣ **Payment** - Complete the payment
7️⃣ **Confirmation** - Get instant booking confirmation! ✓

**Need help?** I can help you find the perfect room! 🏨"""

        return {
            'response': response,
            'intent': 'booking_inquiry',
            'suggestions': ['Find rooms', 'Browse all', 'Contact support']
        }

    def _handle_greeting(self):
        """Handle greeting responses"""
        if self.user:
            response = f"Hello {self.user.first_name or self.user.username}! 👋\n\nWelcome back to HotelHive! How can I help you today?\n\nI can help you:\n• 🔍 Find available rooms\n• 📊 Check your booking status\n• 💬 Answer questions about our hotel"
        else:
            response = "Hello! 👋 Welcome to HotelHive!\n\nI'm here to help you find the perfect room. What would you like to do?\n\n• 🔍 Find available rooms\n• 📅 How to book\n• 💬 Hotel information"

        return {
            'response': response,
            'intent': 'greeting',
            'suggestions': ['Find rooms', 'Hotel info', 'How to book']
        }

    def _handle_hotel_info(self, message):
        """Handle hotel information inquiries"""
        info = {
            'amenities': "🏨 **Our Amenities:**\n• WiFi\n• Air Conditioning\n• Smart TV\n• Premium Bedding\n• 24/7 Support\n• Complimentary Parking\n• Room Service",
            'policy': "📋 **Hotel Policies:**\n• Check-in: 2:00 PM\n• Check-out: 11:00 AM\n• Free cancellation up to 7 days before\n• Refunds processed within 5-7 business days",
            'facilities': "🏨 **Hotel Facilities:**\n• Restaurant & Café\n• 24/7 Reception\n• Valet Parking\n• Wi-Fi Throughout\n• Conference Rooms",
            'parking': "🅿️ **Parking:**\n• Complimentary parking for all guests\n• Valet service available on request\n• Covered parking available",
            'wifi': "📶 **WiFi:**\n• High-speed WiFi in all rooms\n• Free WiFi throughout hotel\n• Password provided at check-in",
        }

        for key in info:
            if key in message:
                return {
                    'response': info[key],
                    'intent': 'hotel_info',
                    'suggestions': ['More info', 'Book now', 'Contact us']
                }

        return {
            'response': "📋 **Hotel Information:**\n\nWould you like to know about:\n• 🛎️ Our Amenities\n• 📋 Policies\n• 🏨 Facilities\n• 🅿️ Parking\n• 📶 WiFi",
            'intent': 'hotel_info',
            'suggestions': ['Amenities', 'Policies', 'Book now']
        }

    def _handle_faq(self, message):
        """Handle FAQ responses"""
        faq_matches = {
            'price': "💰 Prices vary by room type and date:\n• Single: ₹2000+/night\n• Double: ₹3500+/night\n• Suite: ₹7000+/night\n\nWant to see current prices?",
            'cancel': "❌ We offer free cancellation up to 7 days before check-in.\n\nNeed to cancel your booking?",
            'payment': "💳 We accept:\n• Credit Cards\n• Debit Cards\n• UPI\n• Net Banking\n\nAll payments are secure! 🔒",
            'support': "📞 24/7 Customer Support:\n• Email: support@hotelhive.com\n• Phone: +91-XXXX-XXXX-XX\n\nHow can we help?",
        }

        for keyword, response_text in faq_matches.items():
            if keyword in message:
                return {
                    'response': response_text,
                    'intent': 'faq',
                    'suggestions': ['Book now', 'More info', 'Contact us']
                }

        return {
            'response': "I'm not sure about that. 🤔\n\nI can help you with:\n• 🔍 Finding rooms\n• 📅 Booking information\n• 📊 Your booking status\n• 💬 Hotel information\n\nHow can I assist you?",
            'intent': 'unknown',
            'suggestions': ['Find rooms', 'Book now', 'Contact support']
        }

    # ==================== Helper Methods ====================

    def _extract_date(self, message, date_indicator, offset_days=0):
        """Extract date from message"""
        try:
            # Pattern for numeric dates (25-03, 25/03, 25.03)
            date_match = re.search(r'(\d{1,2})[-/.](\d{1,2})', message)
            if date_match:
                day, month = int(date_match.group(1)), int(date_match.group(2))
                year = timezone.now().year
                date = datetime(year, month, day)
                if date < timezone.now():
                    date = datetime(year + 1, month, day)
                return date.date() + timedelta(days=offset_days)

            # Pattern for month names
            months = {
                'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5,
                'june': 6, 'july': 7, 'august': 8, 'september': 9, 'october': 10,
                'november': 11, 'december': 12
            }
            
            for month_name, month_num in months.items():
                if month_name in message:
                    day_match = re.search(rf'{month_name}.*?(\d{{1,2}})', message)
                    if day_match:
                        day = int(day_match.group(1))
                        year = timezone.now().year
                        date = datetime(year, month_num, day)
                        if date < timezone.now():
                            date = datetime(year + 1, month_num, day)
                        return date.date() + timedelta(days=offset_days)

            # Pattern for relative dates
            if 'tomorrow' in message:
                return (timezone.now().date() + timedelta(days=1)) + timedelta(days=offset_days)
            if 'today' in message:
                return timezone.now().date() + timedelta(days=offset_days)
            if 'next week' in message:
                return (timezone.now().date() + timedelta(days=7)) + timedelta(days=offset_days)
            if 'weekend' in message:
                return (timezone.now().date() + timedelta(days=5)) + timedelta(days=offset_days)

        except Exception as e:
            pass

        return None

    def _extract_price(self, message):
        """Extract price from message"""
        try:
            price_match = re.search(r'[₹\$]?(\d+)(?:00)?(?:\s*(?:per|/)\s*night)?', message)
            if price_match:
                return int(price_match.group(1))
        except:
            pass
        return None

    def _extract_guests(self, message):
        """Extract number of guests from message"""
        try:
            guest_patterns = [
                r'(\d)\s+(?:guest|person|people)',
                r'(?:guest|person|people)\s+(\d)',
                r'for\s+(\d)',
            ]
            for pattern in guest_patterns:
                match = re.search(pattern, message)
                if match:
                    return int(match.group(1))
        except:
            pass
        return None

    def _search_available_rooms(self, check_in, check_out, price_max=None):
        """Search for available rooms"""
        try:
            rooms = Room.objects.all()

            # Filter by availability dates if provided
            if check_in and check_out:
                rooms = rooms.filter(
                    available_from__lte=check_in,
                    available_to__gte=check_out
                )

            # Filter by price
            if price_max:
                rooms = rooms.filter(price_per_night__lte=price_max)

            return [
                {
                    'id': room.id,
                    'title': room.title,
                    'room_type': room.room_type,
                    'price_per_night': str(room.price_per_night),
                    'max_guests': room.max_guests,
                    'description': room.description[:100] + '...' if len(room.description) > 100 else room.description
                }
                for room in rooms.order_by('price_per_night')[:10]
            ]
        except Exception as e:
            return []

    def _format_bookings_list(self, bookings):
        """Format bookings for display"""
        booking_list = ""
        for booking in bookings[:5]:
            booking_list += f"• Booking #{booking.id}: {booking.room.title} ({booking.status})\n"
        return booking_list
