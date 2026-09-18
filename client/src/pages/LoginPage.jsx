import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Check, Sprout, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import toast from 'react-hot-toast';

const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  //calling login api
  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(email, password);
      if (res.success) {
        toast.success('Welcome back!');
        navigate('/today');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans">

      {/* Navabar */}
      <Navbar />

      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">

        {/* login form */}
        <div className="w-full max-w-2xl bg-surface border border-border rounded-modal shadow-modal overflow-hidden grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] animate-pop">

          {/* Left Form Area */}
          <div className="p-6 sm:p-10 flex flex-col justify-center">

          {/* Logo & Home Link */}
          <div className="flex items-center justify-between gap-2 mb-7">
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

          {/* heading and content */}
          <h2 className="text-2xl sm:text-[26px] font-extrabold text-ink mb-1.5">
            Welcome back !
          </h2>
          <p className="text-sm text-muted mb-7">
            Login to continue your journey
          </p>

          {/* main form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">

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
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFD] text-sm text-ink outline-none focus:border-brand transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-1.5">
                <Lock size={14} />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFD] text-sm text-ink outline-none focus:border-brand transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/*  Forgot password */}
            <div className="flex items-center justify-end text-xs sm:text-sm mt-1">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-brand font-medium hover:underline text-xs sm:text-sm"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-3 rounded-ctl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-cta transition disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>

            {/* Bottom Link */}
            <div className="text-center mt-3 text-sm text-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand font-semibold hover:underline">
                Sign Up
              </Link>
            </div>
          </form>
        </div>

        {/* Right Illustration Side */}
        <div className="hidden md:flex flex-col items-center justify-center bg-[#F9F8FD] border-l border-border p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-success-soft text-success flex items-center justify-center mb-4">
            <Sprout size={40} />
          </div>

          <h4 className="text-base font-semibold text-ink mb-1">
            Good to see you again!
          </h4>
          <p className="text-xs text-muted max-w-50">
            Let's finish what we started.
          </p>
        </div>
      </div>
    </div>

    {/* Forgot Password Modal */}
    <ForgotPasswordModal
      isOpen={isForgotPasswordOpen}
      onClose={() => setIsForgotPasswordOpen(false)}
      initialEmail={email}
      onSuccess={(resetEmail) => {
        setEmail(resetEmail);
        setPassword('');
      }}
    />
  </div>
  );
};

export default LoginPage;

