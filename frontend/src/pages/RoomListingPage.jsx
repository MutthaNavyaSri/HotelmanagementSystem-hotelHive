import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms } from '../services/hotelService';

export const RoomListingPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ type: 'all', maxPrice: 10000 });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      console.log('Fetching rooms from API...');
      const response = await getRooms();
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // Handle both paginated and non-paginated responses
      let roomsData = [];
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data)) {
          // Direct array response
          roomsData = response.data;
          console.log('✅ Direct array response:', roomsData.length, 'rooms');
        } else if (response.data.results && Array.isArray(response.data.results)) {
          // Paginated response with Django REST Framework
          roomsData = response.data.results;
          console.log('✅ Paginated response:', roomsData.length, 'rooms');
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // Alternative paginated format
          roomsData = response.data.data;
          console.log('✅ Alternative paginated response:', roomsData.length, 'rooms');
        } else {
          console.warn('⚠️ Unexpected response format:', response.data);
          roomsData = [];
        }
      }
      
      setRooms(roomsData);
      setError(null);
      console.log('Rooms state updated. Total:', roomsData.length);
    } catch (err) {
      setError('Failed to load rooms. Please try again.');
      console.error('❌ Error fetching rooms:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (filter.type !== 'all' && room.room_type !== filter.type) {
      return false;
    }
    // Convert price to number for proper numeric comparison
    const roomPrice = parseFloat(room.price_per_night);
    if (roomPrice > filter.maxPrice) {
      return false;
    }
    return true;
  });

  const handleRoomClick = (roomId) => {
    navigate(`/rooms/${roomId}`);
  };

  const roomTypes = ['single', 'double', 'suite', 'deluxe'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Available Rooms</h1>
        <p className="text-slate-600 mb-8">Choose from our collection of comfortable and luxurious rooms</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 border-t-4 border-emerald-700">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Filters</h2>

              {/* Room Type Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-700 mb-3">Room Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="roomType"
                      value="all"
                      checked={filter.type === 'all'}
                      onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                      className="w-4 h-4 text-emerald-700"
                    />
                    <span className="ml-2 text-slate-700">All Types</span>
                  </label>
                  {roomTypes.map(type => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="roomType"
                        value={type}
                        checked={filter.type === type}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                        className="w-4 h-4 text-emerald-700"
                      />
                      <span className="ml-2 text-slate-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Max Price</h3>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={filter.maxPrice}
                  onChange={(e) => setFilter({ ...filter, maxPrice: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                />
                <div className="mt-2 text-sm text-slate-600">
                  Up to ${filter.maxPrice} per night
                </div>
              </div>

              <button
                onClick={() => setFilter({ type: 'all', maxPrice: 500 })}
                className="w-full mt-6 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 active:bg-amber-300 transition font-semibold"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Room Grid */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading rooms...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {!loading && filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No rooms found matching your filters.</p>
              </div>
            )}

            {!loading && filteredRooms.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRooms.map(room => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomClick(room.id)}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer transform hover:scale-105"
                  >
                    {/* Room Image */}
                    <div className="bg-gradient-to-br from-slate-300 to-slate-400 h-48 flex items-center justify-center overflow-hidden">
                      {room.primary_image ? (
                        <img
                          src={room.primary_image}
                          alt={room.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<span className="text-5xl">🛏️</span>';
                          }}
                        />
                      ) : (
                        <span className="text-5xl">🛏️</span>
                      )}
                    </div>

                    {/* Room Info */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{room.title}</h3>
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                          {room.room_type}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">
                        {room.description ? room.description.substring(0, 100) : 'No description available'}...
                      </p>

                      {/* Room Details */}
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-2">👥</span>
                          <span>Up to {room.max_guests} guests</span>
                        </div>
                        {room.amenities && Object.keys(room.amenities).length > 0 && (
                          <div className="flex items-center">
                            <span className="mr-2">✨</span>
                            <span>{Object.keys(room.amenities).join(', ')}</span>
                          </div>
                        )}
                        {room.total_rating > 0 && (
                          <div className="flex items-center">
                            <span className="mr-2">⭐</span>
                            <span>{room.average_rating} ({room.rating_count} reviews)</span>
                          </div>
                        )}
                      </div>

                      {/* Price and Button */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">${room.price_per_night}</span>
                          <span className="text-gray-600 text-sm">/night</span>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
