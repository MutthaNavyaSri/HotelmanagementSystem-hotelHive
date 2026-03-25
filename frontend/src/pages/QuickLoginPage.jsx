import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

export const QuickLoginPage = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123456');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleTestLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Attempting API login with:', email);
      
      // Call backend API directly (no Firebase)
      const response = await axios.post('http://localhost:8000/api/auth/firebase-login/', {
        email,
        firebase_uid: 'test-user-12345'
      });
      
      console.log('Login successful:', response.data);
      localStorage.setItem('djangoToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success('Test login successful! (No Firebase)');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.detail || error.message || 'Login failed';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Quick Test Login</h1>
        <p className="text-center text-gray-600 mb-8">No Firebase required - Test the API directly</p>

        <form onSubmit={handleTestLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            {isLoading ? 'Testing...' : 'Test API Login'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Pre-filled test credentials:</strong><br />
            Email: test@example.com<br />
            Password: test123456
          </p>
        </div>

        <p className="text-center text-gray-600 mt-6 text-sm">
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Back to Firebase Login
          </a>
        </p>
      </div>
    </div>
  );
};
