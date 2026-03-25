import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function BankingPage() {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('history');

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('djangoToken');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }
      // Fetch bookings to show payment history
      const response = await axios.get(`${API_BASE_URL}/bookings/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPayments(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError(err.response?.data?.detail || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'pending_verification': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'pending_verification': return '👀';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50 flex items-center justify-center">
        <p className="text-xl text-slate-600">Loading payment information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-t-4 border-emerald-700">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">💳 Banking & Payments</h1>
          <p className="text-slate-600">Manage your payment methods and view transaction history</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
            ❌ {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'history'
                ? 'text-emerald-700 border-emerald-700'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            📋 Payment History ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('methods')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'methods'
                ? 'text-emerald-700 border-emerald-700'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            💰 Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'summary'
                ? 'text-emerald-700 border-emerald-700'
                : 'text-slate-600 border-transparent hover:text-slate-900'
            }`}
          >
            📊 Summary
          </button>
        </div>

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {payments.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600 text-lg mb-4">No payment transactions yet</p>
                  <a
                    href="/rooms"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Book a Room
                  </a>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Booking ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Room</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{payment.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{payment.room_title || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            ${payment.total_price?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(payment.status)}`}>
                              {getStatusIcon(payment.status)} {payment.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(payment.created_at || new Date()).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bank Transfer Card */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">🏦 Bank Transfer</h3>
                    <p className="text-sm text-gray-600">Direct bank deposit</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Active</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-700">Requirements:</span> Bank account details</p>
                  <p className="text-gray-600">Standard processing time: 2-3 business days</p>
                </div>
              </div>

              {/* Credit/Debit Card */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">💳 Credit/Debit Card</h3>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Active</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-700">Card ending in:</span> •••• •••• •••• 4242</p>
                  <p className="text-gray-600">Immediate payment processing</p>
                </div>
              </div>

              {/* UPI Payment */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">📱 UPI Payment</h3>
                    <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">Active</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-700">Associated UPI:</span> user@bank</p>
                  <p className="text-gray-600">Instant payment processing</p>
                </div>
              </div>

              {/* Digital Wallet */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">🎁 Digital Wallet</h3>
                    <p className="text-sm text-gray-600">PayPal, Apple Pay, Google Wallet</p>
                  </div>
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">Active</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-700">Wallet balance:</span> $0.00</p>
                  <p className="text-gray-600">Quick and secure payments</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
              <p className="text-blue-900 text-sm">
                <span className="font-semibold">💡 Tip:</span> For new payment methods, please visit your account settings.
              </p>
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm mb-2">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg shadow p-6">
                <p className="text-green-700 text-sm mb-2">✅ Confirmed</p>
                <p className="text-3xl font-bold text-green-900">
                  {payments.filter(p => p.status === 'confirmed').length}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg shadow p-6">
                <p className="text-yellow-700 text-sm mb-2">⏳ Pending</p>
                <p className="text-3xl font-bold text-yellow-900">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg shadow p-6">
                <p className="text-blue-700 text-sm mb-2">💰 Total Amount</p>
                <p className="text-3xl font-bold text-blue-900">
                  ${payments.reduce((sum, p) => sum + (p.total_price || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Status Breakdown */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { status: 'confirmed', label: 'Confirmed', color: 'bg-green-100' },
                    { status: 'pending', label: 'Pending Payment', color: 'bg-yellow-100' },
                    { status: 'pending_verification', label: 'Verification Pending', color: 'bg-blue-100' },
                    { status: 'cancelled', label: 'Cancelled', color: 'bg-red-100' },
                  ].map(({ status, label, color }) => {
                    const count = payments.filter(p => p.status === status).length;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${color}`}></div>
                          <span className="text-gray-700">{label}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <a
                    href="/rooms"
                    className="block px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-center"
                  >
                    Book a Room
                  </a>
                  <button
                    className="block w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Download Invoice
                  </button>
                  <a
                    href="/dashboard"
                    className="block px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-center"
                  >
                    Back to Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
