import api from '../api/client';

export const authService = {
  /**
   * Request a 6-digit verification code to the given email
   * @param {string} email
   */
  async sendOtp(email) {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  },

  /**
   * Complete registration with user details and OTP
   * @param {Object} signupData - { firstName, lastName, email, password, confirmPassword, otp }
   */
  async signup(signupData) {
    const response = await api.post('/auth/signup', signupData);
    return response.data;
  },

  /**
   * Log in an existing user with email and password
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Fetch current authenticated user session
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Log out and clear httpOnly cookie
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Request password reset OTP to user email
   * @param {string} email
   */
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with OTP and new password
   * @param {Object} resetData - { email, otp, newPassword, confirmPassword }
   */
  async resetPassword(resetData) {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },
};

export default authService;
