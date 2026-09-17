import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, KeyRound, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/auth.service';
import toast from 'react-hot-toast';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '', onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || '');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setStep(1);
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    if (!email || !email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword(email.trim());
      toast.success(res.message || 'Verification code sent to your email');
      setStep(2);
      setCountdown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset code. Please check your email.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      setLoading(true);
      const res = await authService.forgotPassword(email.trim());
      toast.success(res.message || 'New verification code sent');
      setCountdown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend code';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !otp.trim()) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.resetPassword({
        email: email.trim(),
        otp: Number(otp.trim()),
        newPassword,
        confirmPassword,
      });

      toast.success(res.message || 'Password reset successfully!');
      if (onSuccess) {
        onSuccess(email.trim());
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please check your code.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade">
      <div className="relative w-full max-w-md bg-surface border border-border rounded-modal shadow-modal overflow-hidden p-6 sm:p-8 animate-pop">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-muted hover:text-ink p-1 rounded-chip transition"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center mb-4">
              <KeyRound size={24} />
            </div>

            <h3 className="text-xl font-extrabold text-ink tracking-tight mb-1.5">
              Reset Password
            </h3>
            <p className="text-xs sm:text-sm text-muted mb-6 leading-relaxed">
              Enter your registered email address and we'll send you a 6-digit verification code to reset your password.
            </p>

            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-1.5">
                  <Mail size={14} />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full px-3.5 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFD] text-sm text-ink outline-none focus:border-brand transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="mt-2 w-full py-3 rounded-ctl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-cta transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full py-2 text-xs font-medium text-muted hover:text-ink transition"
              >
                Back to Login
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <div>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand transition mb-4"
            >
              <ArrowLeft size={14} />
              <span>Change email</span>
            </button>

            <h3 className="text-xl font-extrabold text-ink tracking-tight mb-1.5">
              Enter Code & New Password
            </h3>
            <p className="text-xs sm:text-sm text-muted mb-5 leading-relaxed">
              We sent a 6-digit code to <strong className="text-ink">{email}</strong>. Please check your inbox.
            </p>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5">
              {/* OTP Input */}
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-ink mb-1.5">
                  <span>6-Digit Verification Code</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || loading}
                    className="text-xs text-brand font-medium hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                  </button>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-3.5 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFD] text-lg font-bold tracking-[8px] text-center text-ink outline-none focus:border-brand transition"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-1.5">
                  <Lock size={14} />
                  <span>New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
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

              {/* Confirm Password */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-ink mb-1.5">
                  <Lock size={14} />
                  <span>Confirm New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-ctl border border-border-input bg-[#FAFAFD] text-sm text-ink outline-none focus:border-brand transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.length < 6 || !newPassword || !confirmPassword}
                className="mt-2 w-full py-3 rounded-ctl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-cta transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Resetting password...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
