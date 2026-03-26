import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { registerUser, signInWithGoogle } from '../services/authService';

export const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  if (user) {
    navigate('/rooms');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setValidationError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting signup with:', formData.email);
      const response = await registerUser(formData.email, formData.password);
      console.log('Signup successful, response:', response);
      // Update AuthContext with user data immediately
      setUser(response.user);
      setSuccessMessage('✅ Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/rooms');
      }, 1000);
    } catch (error) {
      console.error('Signup error:', error);
      setValidationError(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setValidationError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      console.log('Starting Google signup');
      const response = await signInWithGoogle();
      console.log('Google signup successful, response:', response);
      // Update AuthContext with user data immediately
      setUser(response.user);
      setSuccessMessage('✅ Google signup successful! Redirecting...');
      setTimeout(() => {
        navigate('/rooms');
      }, 1000);
    } catch (error) {
      console.error('Google signup error:', error);
      setValidationError(error.message || 'Google signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F7F7] to-[#F0F0F0] flex items-center justify-center p-3 md:p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md border-t-4 border-[#0F3D3E]">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-1 md:mb-2">Create Account</h1>
        <p className="text-center text-slate-600 text-sm md:text-base mb-6 md:mb-8">Join us for amazing hotel experiences</p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-[#E8F5E9] border border-[#0F3D3E] rounded-lg">
            <p className="text-[#1B5E20] font-semibold text-center text-xs md:text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {validationError && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-700 font-semibold text-center text-xs md:text-sm">❌ {validationError}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-3 md:px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:border-[#0F3D3E]"
                disabled={isLoading || !!successMessage}
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-3 md:px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:border-[#0F3D3E]"
                disabled={isLoading || !!successMessage}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3 md:px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:border-[#0F3D3E]"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 md:px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F3D3E] focus:border-[#0F3D3E]"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {isLoading ? '⟳ Creating account...' : (successMessage ? '✅ Done!' : 'Create Account')}
          </button>
        </form>

        <div className="my-4 md:my-6 flex items-center">
          <div className="flex-1 border-t border-slate-300"></div>
          <span className="px-3 text-slate-500 text-xs md:text-sm">OR</span>
          <div className="flex-1 border-t border-slate-300"></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={isLoading || !!successMessage}
          className="w-full border border-slate-300 text-slate-700 py-2 md:py-2.5 rounded-lg font-semibold text-sm md:text-base hover:bg-slate-50 active:bg-slate-100 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <text x="0" y="20" fontSize="20">G</text>
          </svg>
          Sign up with Google
        </button>

        <p className="text-center text-slate-600 mt-6 md:mt-8 text-xs md:text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-[#0F3D3E] hover:text-[#1A5556] font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};
