import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import { useContext } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ChatBot } from './components/ChatBot';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { QuickLoginPage } from './pages/QuickLoginPage';
import { APITestPage } from './pages/APITestPage';
import { RoomListingPage } from './pages/RoomListingPage';
import { RoomDetailsPage } from './pages/RoomDetailsPage';
import { BookingPage } from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

const HomePage = () => {
  const storyData = [
    { id: 1, author: 'Luxury Rooms', emoji: '🛏️', color: 'from-[#14213D] to-[#1F4068]' },
    { id: 2, author: 'Ocean View', emoji: '🌊', color: 'from-[#00B4D8] to-[#0099BB]' },
    { id: 3, author: 'Sunset Vibes', emoji: '🌅', color: 'from-[#FFD60A] to-[#FFC300]' },
    { id: 4, author: 'City Life', emoji: '🏙️', color: 'from-[#1F4068] to-[#14213D]' },
    { id: 5, author: 'Garden Spa', emoji: '🌸', color: 'from-[#00B4D8] to-[#0099BB]' },
    { id: 6, author: 'Fine Dining', emoji: '🍽️', color: 'from-[#FFD60A] to-[#FFC300]' },
  ];

  const feedData = [
    {
      id: 1,
      author: 'Sarah Johnson',
      handle: '@sarahjohn',
      avatar: '👩‍🦰',
      image: '🏨',
      caption: 'Just had the most amazing stay at HotelHive! The service was incredible and the rooms are so luxurious. Highly recommended! ⭐⭐⭐⭐⭐',
      likes: 1240,
      comments: 89,
      time: '2 days ago',
      color: 'from-blue-50 to-blue-100',
    },
    {
      id: 2,
      author: 'Mike David',
      handle: '@mikedavid',
      avatar: '👨‍💼',
      image: '🌟',
      caption: 'Celebrating our anniversary at HotelHive! The romantic ambiance and perfect service made our night unforgettable 😍',
      likes: 2156,
      comments: 145,
      time: '4 days ago',
      color: 'from-amber-50 to-amber-100',
    },
    {
      id: 3,
      author: 'Emma Wilson',
      handle: '@emmawils',
      avatar: '👩‍🎨',
      image: '🎉',
      caption: 'Best company retreat ever! HotelHive hosted our team perfectly with comfortable rooms and excellent facilities 🏆',
      likes: 892,
      comments: 56,
      time: '1 week ago',
      color: 'from-purple-100 to-blue-100',
    },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Find Your Perfect Hotel</h1>
        <p className="text-xl text-slate-700 mb-8">Discover beautiful rooms and amazing experiences</p>
        <a href="/rooms" className="inline-block px-8 py-3 bg-gradient-to-r from-[#14213D] to-[#1F4068] text-white rounded-lg hover:from-[#0D1620] hover:to-[#162D45] font-semibold shadow-lg transition transform hover:scale-105">
          Explore Rooms
        </a>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gradient-to-r from-amber-50 to-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition border-t-4 border-emerald-700">
              <div className="text-4xl mb-4">🛏️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Comfort</h3>
              <p className="text-slate-600">Luxurious rooms designed for your comfort</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition border-t-4 border-amber-700">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Best Price</h3>
              <p className="text-slate-600">Competitive prices with no hidden charges</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition border-t-4 border-teal-700">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Quality Service</h3>
              <p className="text-slate-600">24/7 customer support and best service</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram-like Feed Section */}
      <div className="bg-gradient-to-b from-white via-emerald-50 to-rose-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 via-rose-600 to-pink-700 bg-clip-text text-transparent mb-4">
              Guest Stories & Experiences
            </h2>
            <p className="text-slate-600 text-lg">See what our guests love about HotelHive</p>
          </div>

          {/* Stories Section */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Trending Stories</h3>
            <div className="flex overflow-x-auto gap-4 pb-4">
              {storyData.map((story) => (
                <div key={story.id} className="flex-shrink-0">
                  <div className={`bg-gradient-to-br ${story.color} rounded-2xl w-32 h-40 flex flex-col items-center justify-center cursor-pointer hover:shadow-xl transition transform hover:scale-105 border-4 border-white shadow-lg`}>
                    <div className="text-6xl mb-3">{story.emoji}</div>
                    <p className="text-white font-bold text-center text-sm px-2">{story.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feed Section */}
          <h3 className="text-2xl font-bold text-slate-900 mb-8">Latest Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {feedData.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:translate-y-1">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{post.avatar}</div>
                    <div>
                      <p className="font-bold text-slate-900">{post.author}</p>
                      <p className="text-xs text-slate-500">{post.handle}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 text-2xl">⋮</button>
                </div>

                {/* Image/Content */}
                <div className={`bg-gradient-to-br ${post.color} h-64 flex items-center justify-center text-8xl`}>
                  {post.image}
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 border-b border-gray-100">
                  <button className="text-3xl hover:scale-125 transition">❤️</button>
                  <button className="text-3xl hover:scale-125 transition">💬</button>
                  <button className="text-3xl hover:scale-125 transition">📤</button>
                </div>

                {/* Likes & Comments */}
                <div className="px-4 pt-3">
                  <p className="font-bold text-sm text-slate-900 mb-2">{post.likes.toLocaleString()} likes</p>
                  
                  {/* Caption */}
                  <p className="text-sm text-slate-800 mb-3">
                    <span className="font-bold text-slate-900">{post.author}</span> {post.caption}
                  </p>

                  {/* Comments Preview */}
                  <p className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer mb-3">
                    View all {post.comments} comments
                  </p>

                  {/* Time */}
                  <p className="text-xs text-slate-400">{post.time}</p>
                </div>

                {/* Comment Input */}
                <div className="flex items-center gap-2 p-4 border-t border-gray-100">
                  <span className="text-2xl">😊</span>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* View More Button */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-rose-600 text-white rounded-full font-bold hover:from-emerald-700 hover:to-rose-700 transition shadow-lg">
              View More Stories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotFoundPage = () => <div className="p-4">404 Not Found</div>;

const Navbar = () => {
  const { user, logout, loading } = useContext(AuthContext);

  return (
    <nav className="bg-gradient-to-r from-blue-50 via-blue-50 to-[#F1F5F9] text-slate-900 py-4 px-4 shadow-lg border-b-4 border-accent backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-3xl drop-shadow-lg">🏨</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#14213D] via-[#00B4D8] to-[#14213D] bg-clip-text text-transparent drop-shadow-sm hover:scale-110 transition-transform">
            HotelHive
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          {/* Home Link */}
          <a
            href="/"
            className="text-slate-700 hover:text-emerald-700 px-4 py-2 rounded-lg transition font-semibold relative group hover:bg-emerald-100 duration-300"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full group-hover:w-full transition-all duration-300"></span>
          </a>

          {/* Rooms Link */}
          <a
            href="/rooms"
            className="text-slate-700 hover:text-emerald-700 px-4 py-2 rounded-lg transition font-semibold relative group hover:bg-emerald-100 duration-300"
          >
            Rooms
            <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full group-hover:w-full transition-all duration-300"></span>
          </a>

          {/* Auth Links */}
          {!loading && user ? (
            <>
              {/* Profile Link */}
              <a
                href="/profile"
                className="bg-gradient-to-r from-[#14213D] to-[#1F4068] hover:from-[#0D1620] hover:to-[#162D45] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="text-lg">👤</span>
                <span className="hidden sm:inline">{user.email || user.username || 'Profile'}</span>
              </a>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
              >
                Logout
              </button>
            </>
          ) : !loading ? (
            <>
              {/* Login Link */}
              <a
                href="/login"
                className="text-slate-700 hover:text-emerald-700 px-4 py-2 rounded-lg transition font-semibold relative group hover:bg-emerald-100 duration-300"
              >
                Login
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full group-hover:w-full transition-all duration-300"></span>
              </a>

              {/* Signup Button */}
              <a
                href="/signup"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Signup
              </a>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-gray-50 min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/quick-login" element={<QuickLoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/api-test" element={<APITestPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/rooms" element={<RoomListingPage />} />
            <Route path="/rooms/:id" element={<RoomDetailsPage />} />
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ChatBot />
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
