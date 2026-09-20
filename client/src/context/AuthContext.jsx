import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('taskflow_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Check if session is already active on initial page load
  const checkAuth = async () => {
    const token = localStorage.getItem('taskflow_token');
    try {
      const data = await authService.getMe();
      if (data?.success && data?.user) {
        setUser(data.user);
        localStorage.setItem('taskflow_user', JSON.stringify(data.user));
      } else {
        if (!token) {
          setUser(null);
          localStorage.removeItem('taskflow_user');
        }
      }
    } catch (err) {
      // If 401 Unauthorized, clear stored state
      if (err.response?.status === 401) {
        setUser(null);
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Send OTP
  const sendOtp = async (email) => {
    return await authService.sendOtp(email);
  };

  // Sign up
  const signup = async (signupData) => {
    const data = await authService.signup(signupData);
    if (data?.success) {
      const userData = data.userResponse || data.user;
      setUser(userData);
      if (data.userResponse?.token) {
        localStorage.setItem('taskflow_token', data.userResponse.token);
      }
      if (userData) {
        localStorage.setItem('taskflow_user', JSON.stringify(userData));
      }
    }
    return data;
  };

  // Login
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data?.success) {
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('taskflow_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('taskflow_user', JSON.stringify(data.user));
      }
    }
    return data;
  };

  // Logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, sendOtp, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

