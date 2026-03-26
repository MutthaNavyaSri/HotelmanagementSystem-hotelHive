import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser, signInWithGoogle } from '../services/authService';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  // If already logged in, redirect to rooms
  if (user) {
    navigate('/rooms');
    return null;
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');
    
    if (!email || !password) {
      setValidationError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login with:', email);
      const response = await loginUser(email, password);
      console.log('Login successful, response:', response);
      // Update AuthContext with user data immediately
      setUser(response.user);
      setSuccessMessage('✅ Login successful! Redirecting...');
      // Show success for 1 second before redirect
      setTimeout(() => {
        navigate('/rooms');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Login failed. Please check your credentials.';
      setValidationError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setValidationError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      console.log('Starting Google login');
      const response = await signInWithGoogle();
      console.log('Google login successful, response:', response);
      // Update AuthContext with user data immediately
      setUser(response.user);
      setSuccessMessage('✅ Google login successful! Redirecting...');
      setTimeout(() => {
        navigate('/rooms');
      }, 1000);
    } catch (error) {
      console.error('Google login error:', error);
      setValidationError(error.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F7F7] to-[#F0F0F0] flex items-center justify-center p-3 md:p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md border-t-4 border-[#0F3D3E]">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-1 md:mb-2">Welcome Back</h1>
        <p className="text-center text-slate-600 text-sm md:text-base mb-6 md:mb-8">Sign in to your account</p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-blue-50 border border-blue-300 rounded-lg">
            <p className="text-primary font-semibold text-center text-xs md:text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {validationError && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-highlight font-semibold text-center text-xs md:text-sm">❌ {validationError}</p>
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 md:px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:border-[#0F3D3E]"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 md:px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:border-[#0F3D3E]"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !!successMessage}
            className="w-full bg-[#0F3D3E] text-white py-2 md:py-2.5 rounded-lg font-semibold text-sm md:text-base hover:bg-[#1A5556] active:bg-[#0D2D2E] transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
          >
            {isLoading ? '⟳ Signing in...' : (successMessage ? '✅ Done!' : 'Sign In')}
          </button>
        </form>

        <div className="my-4 md:my-6 flex items-center">
          <div className="flex-1 border-t border-slate-300"></div>
          <span className="px-3 text-slate-500 text-xs md:text-sm">OR</span>
          <div className="flex-1 border-t border-slate-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading || !!successMessage}
          className="w-full border border-slate-300 text-slate-700 py-2 md:py-2.5 rounded-lg font-semibold text-sm md:text-base hover:bg-slate-50 active:bg-slate-100 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 md:w-5 h-4 md:h-5" viewBox="0 0 24 24">
            <text x="0" y="20" fontSize="20">G</text>
          </svg>
          Sign in with Google
        </button>

        <p className="text-center text-slate-600 mt-6 md:mt-8 text-xs md:text-sm">
          Don't have an account?{' '}
          <a href="/signup" className="text-[#0F3D3E] hover:text-[#1A5556] font-semibold">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};
