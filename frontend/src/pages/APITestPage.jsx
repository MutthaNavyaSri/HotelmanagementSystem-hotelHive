import { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const APITestPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, method, url, data = null, token = null) => {
    try {
      const config = {
        method,
        url: `${API_BASE}${url}`,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      };
      if (data) config.data = data;

      const response = await axios(config);
      setResults(prev => ({
        ...prev,
        [name]: { status: response.status, success: true, data: response.data }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: { 
          status: error.response?.status || 'Error',
          success: false, 
          error: error.response?.data || error.message 
        }
      }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults({});

    // Test 1: Login
    await testEndpoint('Login (Test User)', 'POST', '/auth/firebase-login/', {
      email: 'test@example.com',
      firebase_uid: 'test-user-' + Date.now()
    });

    // Give a moment for the first request to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Get Rooms
    await testEndpoint('Get Rooms', 'GET', '/rooms/');

    // Test 3: Get Recommendations
    await testEndpoint('Get Recommendations', 'GET', '/rooms/recommendations/');

    // Test 4: Admin Stats (requires token)
    const token = localStorage.getItem('djangoToken');
    if (token) {
      await testEndpoint('Admin Stats', 'GET', '/admin/dashboard/stats/', null, token);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">API Test Console</h1>

        <button
          onClick={runAllTests}
          disabled={loading}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold mb-8 disabled:opacity-50"
        >
          {loading ? 'Running Tests...' : 'Run All API Tests'}
        </button>

        <div className="space-y-4">
          {Object.entries(results).map(([testName, result]) => (
            <div
              key={testName}
              className={`p-6 rounded-lg border-2 ${
                result.success
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <h3 className={`text-lg font-bold mb-2 ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testName}: {result.success ? '✅ PASS' : '❌ FAIL'} (Status: {result.status})
              </h3>
              <pre className="text-sm bg-white p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(result.success ? result.data : result.error, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        {Object.keys(results).length > 0 && (
          <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Summary</h2>
            <div className="space-y-2">
              <p className="text-blue-800">
                ✅ Passed: {Object.values(results).filter(r => r.success).length}
              </p>
              <p className="text-red-800">
                ❌ Failed: {Object.values(results).filter(r => !r.success).length}
              </p>
            </div>
            {Object.values(results).every(r => r.success) && (
              <p className="text-green-700 font-bold mt-4">🎉 All APIs are working!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
