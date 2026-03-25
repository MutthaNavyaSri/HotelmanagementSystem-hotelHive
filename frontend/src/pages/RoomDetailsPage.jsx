import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById, createBooking } from '../services/hotelService';
import { useAuth } from '../hooks/useAuth';

export const RoomDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [booking, setBooking] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  // Keyboard navigation for image modal
  useEffect(() => {
    if (!showImageModal) return;

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        setShowImageModal(false);
      } else if (e.key === 'ArrowLeft') {
        goToPreviousImage();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showImageModal, selectedImageIndex, room]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await getRoomById(id);
      setRoom(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load room details. Please try again.');
      console.error('Error fetching room:', err);
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const goToPreviousImage = () => {
    if (!room || !room.images) return;
    setSelectedImageIndex((prev) => (prev === 0 ? room.images.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    if (!room || !room.images) return;
    setSelectedImageIndex((prev) => (prev === room.images.length - 1 ? 0 : prev + 1));
  };

  const isRoomAvailable = (checkInDate, checkOutDate) => {
    if (!room || !room.available_from || !room.available_to) {
      return true; // No availability restriction
    }

    const availableFrom = new Date(room.available_from);
    const availableTo = new Date(room.available_to);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Check if check-in is before available_from
    if (checkIn < availableFrom) {
      return false;
    }

    // Check if check-out is after available_to
    if (checkOut > availableTo) {
      return false;
    }

    return true;
  };

  const getAvailabilityError = (checkInDate, checkOutDate) => {
    if (!room || !room.available_from || !room.available_to) {
      return null;
    }

    const availableFrom = new Date(room.available_from);
    const availableTo = new Date(room.available_to);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (checkIn < availableFrom) {
      return `Check-in date must be on or after ${formatDate(availableFrom)}`;
    }

    if (checkOut > availableTo) {
      return `Check-out date must be on or before ${formatDate(availableTo)}`;
    }

    return null;
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingError('Please select check-in and check-out dates');
      return;
    }

    if (new Date(bookingData.checkIn) >= new Date(bookingData.checkOut)) {
      setBookingError('Check-out date must be after check-in date');
      return;
    }

    // Check room availability
    if (!isRoomAvailable(bookingData.checkIn, bookingData.checkOut)) {
      const availabilityError = getAvailabilityError(bookingData.checkIn, bookingData.checkOut);
      setBookingError(availabilityError || 'Room is not available for the selected dates');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);
      const response = await createBooking(id, bookingData.checkIn, bookingData.checkOut, bookingData.guests);
      setBooking(response.data);
      setShowBookingForm(false);
      // Redirect to booking confirmation or payment page
      setTimeout(() => {
        navigate(`/booking/${response.data.id}`);
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.non_field_errors?.[0] || 
                       err.response?.data?.detail || 
                       'Failed to create booking. Please try again.';
      setBookingError(errorMsg);
      console.error('Booking error:', err);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-rose-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/rooms')}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-md transition"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Room not found</p>
      </div>
    );
  }

  const days = bookingData.checkIn && bookingData.checkOut
    ? Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))
    : 0;
  const totalPrice = days * parseFloat(room.price_per_night);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/rooms')}
          className="mb-6 text-emerald-700 hover:text-emerald-800 font-semibold flex items-center transition"
        >
          ← Back to Rooms
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Details */}
          <div className="lg:col-span-2">
            {/* Room Images */}
            <div className="space-y-4 mb-6">
              {/* Primary Image */}
              {room.images && room.images.length > 0 ? (
                <>
                  <div
                    onClick={() => openImageModal(0)}
                    className="bg-slate-200 h-96 rounded-lg shadow-lg flex items-center justify-center overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
                  >
                    <img
                      src={room.images[0].image}
                      alt={room.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span className="text-8xl">🛏️</span>';
                      }}
                    />
                  </div>
                  {/* Additional Images Gallery */}
                  {room.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-4">
                      {room.images.slice(1, 4).map((img, idx) => (
                        <div
                          key={img.id}
                          onClick={() => openImageModal(idx + 1)}
                          className="bg-slate-200 h-32 rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                        >
                          <img
                            src={img.image}
                            alt="Room image"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><span>📷</span></div>';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gradient-to-br from-emerald-400 to-teal-600 h-96 rounded-lg shadow-lg flex items-center justify-center mb-6">
                  <span className="text-8xl">🛏️</span>
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{room.title}</h1>
                  <span className="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold capitalize">
                    {room.room_type}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold text-gray-900">${room.price_per_night}</span>
                  <p className="text-gray-600">/night</p>
                </div>
              </div>

              <p className="text-gray-600 text-lg mb-6">{room.description || 'No description available'}</p>

              {/* Room Amenities */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">👥</span>
                    <span className="text-gray-700">Up to {room.max_guests} guests</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📶</span>
                    <span className="text-gray-700">WiFi</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">❄️</span>
                    <span className="text-gray-700">AC</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📺</span>
                    <span className="text-gray-700">Smart TV</span>
                  </div>
                  {room.amenities && Object.keys(room.amenities).length > 0 && (
                    <>
                      {Object.entries(room.amenities).map(([key, value]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <span className="text-2xl">✨</span>
                          <span className="text-gray-700">{key}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Reviews */}
              {room.rating_count > 0 && (
                <div className="border-t pt-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Rating</h2>
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-3xl font-bold text-yellow-500">{room.average_rating}</span>
                      <p className="text-gray-600">out of 5</p>
                    </div>
                    <p className="text-gray-600">Based on {room.rating_count} reviews</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book This Room</h2>

              {/* Room Availability Status */}
              {room.available_from && room.available_to && (
                <div className="mb-6 p-4 bg-teal-50 border-2 border-teal-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">📅</span>
                    <h3 className="font-bold text-teal-900">Availability</h3>
                  </div>
                  <p className="text-sm text-teal-800 mb-2">
                    <strong>Available From:</strong>{' '}
                    {new Date(room.available_from).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-teal-800">
                    <strong>Available Until:</strong>{' '}
                    {new Date(room.available_to).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {booking && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-emerald-700">✅ Booking created successfully!</p>
                  <p className="text-sm text-emerald-600 mt-2">Redirecting to payment...</p>
                </div>
              )}

              {bookingError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-rose-700 font-semibold">⚠️ {bookingError}</p>
                </div>
              )}

              {!showBookingForm && !booking ? (
                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                    } else {
                      setShowBookingForm(true);
                    }
                  }}
                  className="w-full px-4 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-semibold text-lg shadow-md"
                >
                  {user ? 'Reserve Now' : 'Login to Book'}
                </button>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                      min={
                        room.available_from
                          ? room.available_from
                          : new Date().toISOString().split('T')[0]
                      }
                      max={room.available_to || undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                      min={bookingData.checkIn || (room.available_from ? room.available_from : new Date().toISOString().split('T')[0])}
                      max={room.available_to || undefined}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={room.max_guests}
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  {days > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">${room.price_per_night} × {days} nights</span>
                        <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-bold text-slate-900">Total:</span>
                        <span className="text-xl font-bold text-emerald-700">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Availability Warning */}
                  {bookingData.checkIn &&
                    bookingData.checkOut &&
                    !isRoomAvailable(bookingData.checkIn, bookingData.checkOut) && (
                      <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-lg">
                        <p className="text-sm font-semibold text-rose-700">⚠️ Dates Outside Availability</p>
                        <p className="text-xs text-rose-600 mt-1">
                          {getAvailabilityError(bookingData.checkIn, bookingData.checkOut)}
                        </p>
                      </div>
                    )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={
                        bookingLoading ||
                        !bookingData.checkIn ||
                        !bookingData.checkOut ||
                        !isRoomAvailable(bookingData.checkIn, bookingData.checkOut)
                      }
                      className="flex-1 px-4 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      title={
                        !isRoomAvailable(bookingData.checkIn, bookingData.checkOut)
                          ? 'Selected dates are outside room availability'
                          : 'Proceed to payment'
                      }
                    >
                      {bookingLoading ? 'Processing...' : 'Continue to Payment'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Booking Info */}
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h3 className="font-semibold text-emerald-900 mb-2">Why book with us?</h3>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>✅ Best price guarantee</li>
                  <li>✅ Free cancellation</li>
                  <li>✅ 24/7 customer support</li>
                  <li>✅ Secure payment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal/Lightbox */}
        {showImageModal && room && room.images && room.images.length > 0 && (
          <div
            className="fixed inset-0 bg-black bg-opacity-85 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <div
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main Image Display */}
              <div className="bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
                <img
                  src={room.images[selectedImageIndex].image}
                  alt={`${room.title} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-auto max-h-96 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Navigation Controls */}
              {room.images.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-emerald-700 hover:bg-emerald-800 text-white p-3 rounded-full shadow-lg transition transform hover:scale-110 z-10"
                    title="Previous (← arrow key)"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={goToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-700 hover:bg-emerald-800 text-white p-3 rounded-full shadow-lg transition transform hover:scale-110"
                    title="Next (→ arrow key)"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full shadow-lg transition"
                title="Close (Esc)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Image Counter */}
              <div className="text-center mt-4 text-white">
                <p className="text-sm font-semibold">
                  Image {selectedImageIndex + 1} of {room.images.length}
                </p>
                {room.images.length > 1 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Use arrow keys or click buttons to navigate. Press Esc to close.
                  </p>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {room.images.length > 1 && (
                <div className="flex gap-2 justify-center mt-4 overflow-x-auto pb-2">
                  {room.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition ${
                        idx === selectedImageIndex
                          ? 'border-emerald-500 shadow-lg'
                          : 'border-gray-600 hover:border-emerald-400'
                      }`}
                    >
                      <img
                        src={img.image}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
