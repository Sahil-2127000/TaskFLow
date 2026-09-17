import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Check, ClipboardCheck, ArrowRight, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Modal states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const { sendOtp, signup } = useAuth();
  const navigate = useNavigate();

  // Step 1: Validate inputs and trigger sendOtp
  const handleInitiateSignup = async (e) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      const res = await sendOtp(email.trim());
      if (res.success) {
        toast.success('OTP sent to your email!');
        setShowOtpModal(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit OTP and complete signup
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    // Split Full Name into First & Last
    const parts = fullName.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || parts[0];

    try {
      setIsVerifyingOtp(true);
      const res = await signup({
        firstName,
        lastName,
        email: email.trim(),
        password,
        confirmPassword,
        otp: otp.trim(),
      });

      if (res.success) {
        toast.success('Account created successfully!');
        setShowOtpModal(false);
        navigate('/today');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      toast.error(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl bg-surface border border-border rounded-modal shadow-modal overflow-hidden grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] animate-pop">
          {/* Left Form Side */}
          <div className="p-6 sm:p-10 flex flex-col justify-center">
          {/* Logo & Home Link */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <Link to="/" className="flex items-center gap-2 group" title="Go to home">
              <div className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center text-white group-hover:bg-brand-hover transition">
                <Check size={18} strokeWidth={3} />
              </div>
              <span className="text-lg font-extrabold text-ink">TaskFlow</span>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand px-2.5 py-1 rounded-chip hover:bg-brand-soft/50 transition"
              title="Return to homepage"
            >
              <ArrowLeft size={14} />
              <span>Home</span>
            </Link>
          </div>

          <h2 className="text-2xl sm:text-[26px] font-extrabold text-ink mb-1.5">
            Create your account
          </h2>
          <p className="text-sm text-muted mb-6">
            Start managing your tasks today
          </p>

          <form onSubmit={handleInitiateSignup} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-1.5">
                <User size={14} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFD] text-sm text-ink outline-none focus:border-brand transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-1.5">
                <Mail size={14} />
                <span>Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3.5 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFD] text-sm text-ink outline-none focus:border-brand transition"
              />
            </div>

            {/* Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-1.5">
                  <Lock size={14} />
                  <span>Password</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFD] text-sm text-ink outline-none focus:border-brand transition"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-1.5">
                  <Lock size={14} />
                  <span>Confirm</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFD] text-sm text-ink outline-none focus:border-brand transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 rounded-ctl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-cta transition disabled:opacity-50"
            >
              {isLoading ? 'Sending verification code...' : 'Sign Up'}
            </button>

            {/* Bottom Link */}
            <div className="text-center mt-3 text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-brand font-semibold hover:underline">
                Login
              </Link>
            </div>
          </form>
        </div>

        {/* Right Illustration Side */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[#F9F8FD] border-l border-border p-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-brand-soft text-brand flex items-center justify-center mb-4">
            <ClipboardCheck size={40} />
          </div>

          <h4 className="text-base font-semibold text-ink mb-1">
            Get things done,
          </h4>
          <p className="text-xs text-muted">
            one task at a time.
          </p>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-modal p-6 sm:p-8 max-w-md w-full shadow-modal text-center relative animate-pop border border-border">
            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              className="absolute right-4 top-4 text-muted hover:text-ink transition"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto mb-4">
              <Mail size={26} />
            </div>

            <h3 className="text-xl font-bold text-ink mb-1.5">
              Verify your email
            </h3>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Enter the 6-digit verification code sent to <br />
              <strong className="text-ink">{email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full py-3 rounded-ctl border border-border-input bg-[#FAFAFD] text-center text-2xl font-bold tracking-[8px] text-ink outline-none focus:border-brand transition"
              />

              <button
                type="submit"
                disabled={isVerifyingOtp || otp.length !== 6}
                className="mt-1 w-full py-3 rounded-ctl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-cta transition disabled:opacity-50"
              >
                {isVerifyingOtp ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default SignupPage;
