import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if session is already active on initial page load
  const checkAuth = async () => {
    try {
      const data = await authService.getMe();
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
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
      setUser(data.userResponse || data.user);
    }
    return data;
  };

  // Login
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data?.success) {
      setUser(data.user);
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
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, sendOtp, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
