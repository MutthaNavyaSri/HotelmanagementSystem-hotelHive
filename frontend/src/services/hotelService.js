import api from './api';

// Room Services
export const getRooms = (params = {}) => {
  return api.get('/rooms/', { params });
};

export const getRoomById = (id) => {
  return api.get(`/rooms/${id}/`);
};

export const getRecommendedRooms = () => {
  return api.get('/rooms/recommendations/');
};

export const checkRoomAvailability = (roomId, checkIn, checkOut) => {
  return api.get(`/rooms/${roomId}/availability/`, {
    params: { check_in: checkIn, check_out: checkOut }
  });
};

// Booking Services
export const createBooking = (roomId, checkIn, checkOut, guests) => {
  return api.post('/bookings/', {
    room_id: roomId,
    check_in: checkIn,
    check_out: checkOut,
    guests
  });
};

export const getBookings = () => {
  return api.get('/bookings/');
};

export const getBookingById = (id) => {
  return api.get(`/bookings/${id}/`);
};

export const cancelBooking = (id) => {
  return api.post(`/bookings/${id}/cancel/`);
};

// Payment Services
export const simulatePayment = (bookingId) => {
  return api.post('/payments/simulate/', { booking_id: bookingId });
};

export const verifyPayment = (bookingId, transactionId, userName, userEmail, screenshot) => {
  const formData = new FormData();
  formData.append('booking_id', bookingId);
  formData.append('transaction_id', transactionId);
  formData.append('user_name', userName);
  formData.append('user_email', userEmail);
  formData.append('proof_screenshot', screenshot);
  
  return api.post('/payments/verify/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const getPaymentStatus = (bookingId) => {
  return api.get('/payments/status/', { params: { booking_id: bookingId } });
};

// Review Services
export const createReview = (bookingId, rating, comment) => {
  return api.post('/reviews/', {
    booking_id: bookingId,
    rating,
    comment
  });
};

export const getReviews = (roomId) => {
  return api.get('/reviews/', { params: { room: roomId } });
};

// Admin Services
export const getAdminStats = () => {
  return api.get('/admin/dashboard/stats/');
};

export const getUnverifiedPayments = () => {
  return api.get('/payments/admin_list/');
};

export const approvePayment = (paymentId) => {
  return api.post(`/payments/${paymentId}/admin_approve/`);
};

export const rejectPayment = (paymentId, rejectionReason) => {
  return api.post(`/payments/${paymentId}/admin_reject/`, {
    rejection_reason: rejectionReason
  });
};
