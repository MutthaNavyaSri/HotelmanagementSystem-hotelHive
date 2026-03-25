import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, simulatePayment } from '../services/hotelService';

export const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({
    transactionId: '',
    userName: '',
    userEmail: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  // Auto-redirect to profile after 5 seconds when success message shows
  useEffect(() => {
    if (booking && booking.status !== 'pending') {
      const timer = setTimeout(() => {
        console.log('Auto-redirecting to profile...');
        navigate('/profile');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [booking?.status, navigate]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await getBookingById(id);
      setBooking(response.data);
      setError(null);
      // Pre-fill user data if available
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.email) {
        setPaymentData(prev => ({
          ...prev,
          userEmail: user.email,
          userName: user.username || ''
        }));
      }
    } catch (err) {
      setError('Failed to load booking details. Please try again.');
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!paymentData.transactionId || !paymentData.userName || !paymentData.userEmail) {
      setPaymentError('Please fill in all fields');
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError(null);
      console.log('Processing payment for booking:', id);
      
      const response = await simulatePayment(id);
      console.log('Payment response:', response);
      
      // Payment processed - booking is now in pending verification status
      // Refresh booking details to show updated status
      console.log('Fetching updated booking details...');
      await fetchBooking();
      
      console.log('Updated booking, success message should show now');
    } catch (err) {
      console.error('Payment error:', err);
      const errorMsg = err.response?.data?.detail || 'Payment processing failed. Please try again.';
      setPaymentError(errorMsg);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50 flex items-center justify-center">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-rose-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/rooms')}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-semibold"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50 flex items-center justify-center">
        <p className="text-slate-600">Booking not found</p>
      </div>
    );
  }

  const checkInDate = new Date(booking.check_in);
  const checkOutDate = new Date(booking.check_out);
  const nights = booking.nights || Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const totalAmount = parseFloat(booking.total_price || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Status */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/rooms')}
            className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center mb-4"
          >
            ← Back to Rooms
          </button>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Booking Details</h1>
              <p className="text-slate-600 mt-2">Booking ID: #{booking.id}</p>
            </div>
            <div>
              <span className={`px-4 py-2 rounded-full font-semibold capitalize text-white ${
                booking.status === 'pending' ? 'bg-amber-500' :
                booking.status === 'pending_verification' ? 'bg-teal-500' :
                booking.status === 'confirmed' ? 'bg-emerald-500' :
                booking.status === 'completed' ? 'bg-slate-500' :
                booking.status === 'cancelled' ? 'bg-rose-500' : 'bg-slate-400'
              }`}>
                {booking.status?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Success Message */}
          {booking.status !== 'pending' && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-700 rounded-lg p-6 mb-6 shadow-md animate-pulse">
              <div className="flex items-start gap-4">
                <span className="text-5xl">⏳</span>
                <div className="flex-1">
                  <p className="text-emerald-900 font-bold text-2xl">Payment Received! ✅</p>
                  <p className="text-emerald-700 mt-3 font-semibold text-lg leading-relaxed">
                    Your room booking is under review by our admin team.
                  </p>
                  <p className="text-emerald-600 mt-3 text-base leading-relaxed">
                    💡 <strong>Next Step:</strong> Click the button below to check your booking status in your profile. We will notify you once your booking is confirmed!
                  </p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        console.log('Profile button clicked, navigating to /profile');
                        navigate('/profile');
                      }}
                      type="button"
                      className="w-full px-8 py-4 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 active:bg-emerald-900 transition shadow-lg text-base cursor-pointer"
                    >
                      👤 Go to Profile - Check Status
                    </button>
                    <button
                      onClick={() => {
                        console.log('Rooms button clicked, navigating to /rooms');
                        navigate('/rooms');
                      }}
                      type="button"
                      className="w-full px-8 py-4 bg-white border-2 border-emerald-700 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 active:bg-emerald-100 transition text-base cursor-pointer"
                    >
                      🔄 Browse More Rooms
                    </button>
                  </div>
                  <p className="text-sm text-emerald-600 mt-4">Redirecting to profile in 5 seconds...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8 mb-6 border-t-4 border-emerald-700">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Booking Summary</h2>

              {/* Room Info */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">Room Details</h3>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-slate-800 font-semibold">{booking.room_title}</p>
                  <p className="text-sm text-slate-600">Room</p>
                </div>
              </div>

              {/* Dates */}
              <div className="mb-6 pb-6 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-600">Check-in</label>
                    <p className="font-semibold text-slate-900">
                      {checkInDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Check-out</label>
                    <p className="font-semibold text-slate-900">
                      {checkOutDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-4">{nights} night{nights !== 1 ? 's' : ''}</p>
              </div>

              {/* Payment Form */}
              {booking.status === 'pending' ? (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Payment Details</h3>
                  
                  {paymentError && (
                    <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                      <p className="text-rose-700">{paymentError}</p>
                    </div>
                  )}

                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={paymentData.userName}
                        onChange={(e) => setPaymentData({ ...paymentData, userName: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={paymentData.userEmail}
                        onChange={(e) => setPaymentData({ ...paymentData, userEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Transaction ID / Reference Number
                      </label>
                      <input
                        type="text"
                        value={paymentData.transactionId}
                        onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                        placeholder="Enter your bank transaction ID"
                      />
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg mt-6 border border-emerald-200">
                      <p className="text-sm text-emerald-800 mb-2">💡 Demo Mode:</p>
                      <p className="text-xs text-emerald-700">
                        In this demo, you can enter any transaction ID. In production, this would integrate with a real payment gateway.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={paymentLoading}
                      className="w-full px-4 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 active:bg-emerald-900 transition font-semibold disabled:opacity-50 mt-6 shadow"
                    >
                      {paymentLoading ? 'Processing Payment...' : `Pay $${totalAmount.toFixed(2)}`}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-emerald-900">
                    {booking.status === 'pending_verification' && '✋ Your booking is pending verification. An admin will review it shortly.'}
                    {booking.status === 'confirmed' && '✅ Your booking is confirmed! You will receive a confirmation email shortly.'}
                    {booking.status === 'completed' && '🎉 Your stay is complete. Thank you for booking with us!'}
                    {booking.status === 'cancelled' && '❌ This booking has been cancelled.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 border-t-4 border-amber-700">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Price Breakdown</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">${booking.room_price || 0} × {nights} nights</span>
                  <span className="font-semibold text-slate-800">${totalAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Tax & Fees</span>
                  <span className="font-semibold text-slate-800">$0</span>
                </div>

                <div className="border-t border-slate-200 pt-4 flex justify-between">
                  <span className="font-bold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-bold text-emerald-700">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  🔒 Your payment is secure and encrypted.
                </p>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">Cancellation Policy</h3>
                <p className="text-xs text-slate-600">
                  Free cancellation up to 24 hours before check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
