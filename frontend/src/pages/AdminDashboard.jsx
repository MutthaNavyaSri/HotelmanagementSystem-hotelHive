import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const API_BASE_URL = 'http://localhost:8000/api';

  // Fetch all bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('djangoToken');
      const response = await axios.get(`${API_BASE_URL}/bookings/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.detail || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setUpdating(bookingId);
      const token = localStorage.getItem('djangoToken');
      const response = await axios.patch(`${API_BASE_URL}/bookings/${bookingId}/`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the booking in the list
      setBookings(bookings.map(b => b.id === bookingId ? response.data : b));
      setSuccessMessage(`Booking #${bookingId} status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err.response?.data?.detail || 'Failed to update booking status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'pending_verification': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '🟡';
      case 'pending_verification': return '🔵';
      case 'confirmed': return '✅';
      case 'completed': return '⚪';
      case 'cancelled': return '🔴';
      default: return '❓';
    }
  };

  // Filter bookings by status
  const filteredBookings = selectedStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === selectedStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all bookings and update their statuses</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            ✅ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            ❌ {error}
          </div>
        )}

        {/* Status Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedStatus === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedStatus === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🟡 Pending ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button
            onClick={() => setSelectedStatus('pending_verification')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedStatus === 'pending_verification' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🔵 Pending Verification ({bookings.filter(b => b.status === 'pending_verification').length})
          </button>
          <button
            onClick={() => setSelectedStatus('confirmed')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedStatus === 'confirmed' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            ✅ Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setSelectedStatus('cancelled')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedStatus === 'cancelled' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            🔴 Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
          </button>
        </div>

        {/* Bookings Table */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Booking ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Room</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Check-in</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Check-out</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Guests</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{booking.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{booking.room_title || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(booking.check_in).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(booking.check_out).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{booking.guests}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)} {booking.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${booking.total_price?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'pending_verification')}
                              disabled={updating === booking.id}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              {updating === booking.id ? 'Updating...' : 'Verify'}
                            </button>
                          )}
                          {booking.status === 'pending_verification' && (
                            <>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                disabled={updating === booking.id}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50"
                              >
                                {updating === booking.id ? 'Updating...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                disabled={updating === booking.id}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition disabled:opacity-50"
                              >
                                {updating === booking.id ? 'Updating...' : 'Reject'}
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              disabled={updating === booking.id}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition disabled:opacity-50"
                            >
                              {updating === booking.id ? 'Updating...' : 'Mark Complete'}
                            </button>
                          )}
                          {['pending', 'pending_verification', 'confirmed'].includes(booking.status) && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              disabled={updating === booking.id}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition disabled:opacity-50"
                            >
                              {updating === booking.id ? 'Updating...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <p className="text-yellow-700 text-sm mb-2">🟡 Pending</p>
            <p className="text-3xl font-bold text-yellow-900">{bookings.filter(b => b.status === 'pending').length}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6">
            <p className="text-blue-700 text-sm mb-2">🔵 Pending Verification</p>
            <p className="text-3xl font-bold text-blue-900">{bookings.filter(b => b.status === 'pending_verification').length}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6">
            <p className="text-green-700 text-sm mb-2">✅ Confirmed</p>
            <p className="text-3xl font-bold text-green-900">{bookings.filter(b => b.status === 'confirmed').length}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6">
            <p className="text-red-700 text-sm mb-2">🔴 Cancelled</p>
            <p className="text-3xl font-bold text-red-900">{bookings.filter(b => b.status === 'cancelled').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
