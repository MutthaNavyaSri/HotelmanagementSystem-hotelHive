import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

// Register user with Firebase and Django
export const registerUser = async (email, password) => {
  try {
    console.log('Creating Firebase user:', email);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Firebase user created:', result.user.uid);
    
    // Sync with Django backend
    const response = await api.post('/auth/signup/', {
      email,
      firebase_uid: result.user.uid,
      password
    });
    
    localStorage.setItem('djangoToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    const message = error.response?.data?.detail || error.response?.data?.email?.[0] || error.message || 'Registration failed';
    throw new Error(message);
  }
};

// Login user with Firebase and Django
export const loginUser = async (email, password) => {
  try {
    console.log('Logging in Firebase user:', email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase login successful:', result.user.uid);
    
    // Sync with Django backend
    const response = await api.post('/auth/firebase-login/', {
      email,
      firebase_uid: result.user.uid
    });
    
    localStorage.setItem('djangoToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    const message = error.response?.data?.detail || error.response?.data?.message || error.message || 'Login failed';
    throw new Error(message);
  }
};

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google Sign-In');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log('Google Sign-In successful:', result.user.uid);
    
    // Sync with Django backend
    const response = await api.post('/auth/firebase-login/', {
      email: result.user.email,
      firebase_uid: result.user.uid
    });
    
    localStorage.setItem('djangoToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Google Sign-In error:', error);
    const message = error.response?.data?.detail || error.message || 'Google Sign-In failed';
    throw new Error(message);
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('djangoToken');
    localStorage.removeItem('user');
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Setup auth state listener
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    // If Firebase auth exists, use it
    if (user) {
      const savedUser = getCurrentUser();
      callback(savedUser);
    } else {
      // If Firebase auth is null, check localStorage for Django user
      // This handles cases where user logged in but Firebase session expired
      const savedUser = getCurrentUser();
      callback(savedUser); // This will be null if no localStorage user, otherwise returns saved user
    }
  });
};
