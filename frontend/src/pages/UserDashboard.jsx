import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function UserDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('djangoToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
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

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">👤 My Profile</h1>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span> {user?.email}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Username:</span> {user?.username || 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Member Since:</span> {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <a
            href="/rooms"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">🛎️ Browse Rooms</h3>
            <p className="text-gray-600">Discover new rooms available for booking</p>
          </a>
          <a
            href="/banking"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">💳 Banking & Payments</h3>
            <p className="text-gray-600">View payment history and manage payment methods</p>
          </a>
          <a
            href="/dashboard"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition hover:bg-gray-50"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">⚙️ Account Settings</h3>
            <p className="text-gray-600">Update your profile and preferences</p>
          </a>
        </div>

        {/* Bookings Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📋 My Bookings</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              ❌ {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 text-lg mb-4">No bookings yet</p>
              <a
                href="/rooms"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Browse Rooms
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {booking.room_title || 'Room'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Booking ID: #{booking.id}
                      </p>
                    </div>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)} {booking.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">Check-in</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.check_in).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">Check-out</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.check_out).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">Guests</p>
                      <p className="font-semibold text-gray-900">{booking.guests}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">Total Price</p>
                      <p className="font-semibold text-gray-900">
                        ${booking.total_price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 text-sm">
                      {booking.status === 'pending' && '⏳ Your booking is pending. Waiting for confirmation...'}
                      {booking.status === 'pending_verification' && '👀 Your booking is under verification. An admin will review it.'}
                      {booking.status === 'confirmed' && '✅ Your booking is confirmed! Prepare for your stay.'}
                      {booking.status === 'completed' && '🎉 Your stay is complete. Thank you for choosing us!'}
                      {booking.status === 'cancelled' && '❌ This booking has been cancelled.'}
                    </p>
                  </div>

                  {/* Booking Actions */}
                  <div className="mt-4 flex gap-3">
                    {booking.status === 'pending' && (
                      <a
                        href={`/booking/${booking.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                      >
                        View Booking
                      </a>
                    )}
                    {['pending_verification', 'confirmed'].includes(booking.status) && (
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg cursor-not-allowed font-semibold text-sm"
                        disabled
                      >
                        Booking Locked
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Statistics */}
        {bookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-6">
              <p className="text-yellow-700 text-sm mb-2">🟡 Pending</p>
              <p className="text-3xl font-bold text-yellow-900">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-6">
              <p className="text-blue-700 text-sm mb-2">🔵 Verification</p>
              <p className="text-3xl font-bold text-blue-900">
                {bookings.filter(b => b.status === 'pending_verification').length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-6">
              <p className="text-green-700 text-sm mb-2">✅ Confirmed</p>
              <p className="text-3xl font-bold text-green-900">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-6">
              <p className="text-red-700 text-sm mb-2">🔴 Cancelled</p>
              <p className="text-3xl font-bold text-red-900">
                {bookings.filter(b => b.status === 'cancelled').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
