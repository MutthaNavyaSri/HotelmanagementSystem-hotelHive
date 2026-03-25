import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const token = localStorage.getItem('djangoToken');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setBookings([]);
        setIsLoadingBookings(false);
        return;
      }

      const apiUrl = `${API_BASE_URL}/bookings/`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Handle paginated response - extract results array
      let bookingsData = [];
      if (response.data && response.data.results) {
        bookingsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        bookingsData = response.data;
      } else {
        bookingsData = [];
      }
      
      setBookings(bookingsData);
      
      setError(null);
      setIsLoadingBookings(false);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch bookings';
      setError(errorMessage);
      setBookings([]);
      setIsLoadingBookings(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-amber-100 text-amber-900 border-amber-400',
      'pending_verification': 'bg-teal-100 text-teal-900 border-teal-400',
      'confirmed': 'bg-emerald-100 text-emerald-900 border-emerald-400',
      'completed': 'bg-slate-100 text-slate-800 border-slate-400',
      'cancelled': 'bg-rose-100 text-rose-900 border-rose-400'
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'pending_verification': '👀',
      'confirmed': '✅',
      'completed': '🎉',
      'cancelled': '❌'
    };
    return icons[status] || '❓';
  };

  const getStatusMessage = (status) => {
    const messages = {
      'pending': 'Your booking is pending. Waiting for confirmation...',
      'pending_verification': 'Your booking is under verification. An admin will review it.',
      'confirmed': 'Your booking is confirmed! Prepare for your stay.',
      'completed': 'Your stay is complete. Thank you for choosing us!',
      'cancelled': 'This booking has been cancelled.'
    };
    return messages[status] || 'Unknown status';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };



  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* User Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-t-4 border-emerald-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900 mb-6">👤 My Profile</h1>
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wider">EMAIL ADDRESS</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{user?.email || 'N/A'}</p>
                </div>
                <div className="border-b border-slate-200 pb-3">
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wider">USERNAME</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{user?.username || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wider">MEMBER SINCE</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-8 py-3 bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-lg hover:from-emerald-800 hover:to-teal-800 transition font-semibold whitespace-nowrap shadow-lg transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
            <p className="font-semibold">❌ Warning</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Bookings Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">📋 My Bookings</h2>
            <button
              onClick={fetchUserBookings}
              disabled={isLoadingBookings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold text-sm"
            >
              {isLoadingBookings ? '⟳ Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {isLoadingBookings ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading your bookings...</p>
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-6">
              {bookings.map((booking) => {
                if (!booking || !booking.id) {
                  return null;
                }
                
                return (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-700 hover:shadow-lg transition">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{booking.room_title || 'Room'}</h3>
                        <p className="text-gray-600 text-sm mt-1">Booking ID: #{booking.id}</p>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)} {booking.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 py-6 border-y">
                      <div>
                        <p className="text-gray-600 text-xs font-semibold uppercase mb-2">Check-in</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(booking.check_in)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs font-semibold uppercase mb-2">Check-out</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(booking.check_out)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs font-semibold uppercase mb-2">Guests</p>
                        <p className="text-lg font-semibold text-gray-900">{booking.guests || 1} {booking.guests === 1 ? 'Guest' : 'Guests'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs font-semibold uppercase mb-2">Total Price</p>
                        <p className="text-lg font-semibold text-blue-600">${parseFloat(booking.total_price || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-900 text-sm">{getStatusMessage(booking.status)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 text-lg mb-6 font-semibold">No bookings yet</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-blue-900 text-sm"><strong>How to create a booking:</strong></p>
                <ol className="text-blue-900 text-sm mt-2 ml-4 space-y-1 list-decimal">
                  <li>Go to <strong>Rooms</strong> section</li>
                  <li>Click on any room to view details</li>
                  <li>Select your check-in and check-out dates</li>
                  <li>Enter number of guests</li>
                  <li>Click "Book Now" to create reservation</li>
                  <li>Complete payment on booking details page</li>
                  <li>Your booking will appear here!</li>
                </ol>
              </div>
              <a
                href="/rooms"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Browse Rooms
              </a>
            </div>
          )}
        </div>

        {/* Statistics */}
        {bookings && bookings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600 text-sm font-semibold mb-2">Total</p>
              <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-6 text-center">
              <p className="text-yellow-700 text-sm font-semibold mb-2">⏳ Pending</p>
              <p className="text-3xl font-bold text-yellow-900">
                {bookings.filter(b => b && b.status === 'pending').length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-6 text-center">
              <p className="text-blue-700 text-sm font-semibold mb-2">👀 Verification</p>
              <p className="text-3xl font-bold text-blue-900">
                {bookings.filter(b => b && b.status === 'pending_verification').length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-6 text-center">
              <p className="text-green-700 text-sm font-semibold mb-2">✅ Confirmed</p>
              <p className="text-3xl font-bold text-green-900">
                {bookings.filter(b => b && b.status === 'confirmed').length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg shadow p-6 text-center">
              <p className="text-red-700 text-sm font-semibold mb-2">❌ Cancelled</p>
              <p className="text-3xl font-bold text-red-900">
                {bookings.filter(b => b && b.status === 'cancelled').length}
              </p>
            </div>
          </div>
        )}

        {/* Explore CTA */}
        {(!bookings || bookings.length === 0) && !isLoadingBookings && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-8 text-center mt-8">
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Ready to start your adventure?</h3>
            <p className="text-blue-700 mb-6">Browse our amazing rooms and create your first booking!</p>
            <a
              href="/rooms"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition shadow-md"
            >
              Explore Rooms Now
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
