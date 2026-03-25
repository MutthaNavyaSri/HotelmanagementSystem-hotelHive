import React, { createContext, useState, useEffect } from 'react';
import { onAuthChange, getCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // IMMEDIATELY check localStorage first - don't wait for Firebase
    const savedUser = getCurrentUser();
    console.log('AuthContext: Retrieved user from localStorage:', savedUser);
    if (savedUser && savedUser.email) {
      console.log('AuthContext: User email found:', savedUser.email);
      setUser(savedUser);
      setLoading(false);
      return; // Early exit if user found in localStorage
    }

    setLoading(false); // Mark as not loading if no user in localStorage

    // Then set up Firebase listener as fallback
    const unsubscribe = onAuthChange((currentUser) => {
      console.log('AuthContext: Firebase auth change detected:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = () => {
    // Clear auth token from localStorage
    localStorage.removeItem('djangoToken');
    localStorage.removeItem('user');
    setUser(null);
    // Redirect to home
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
