import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center font-sans animate-fade">
      {/* Visual Badge / Icon */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-soft text-brand flex items-center justify-center mb-6 shadow-sm border border-brand/10">
        <AlertTriangle size={42} strokeWidth={2.2} />
      </div>

      {/* 404 Title */}
      <h1 className="text-6xl sm:text-7xl font-extrabold text-ink tracking-tight mb-2">
        404
      </h1>

      <h2 className="text-xl sm:text-2xl font-bold text-ink mb-3">
        Page Not Found
      </h2>

      <p className="text-sm sm:text-base text-muted max-w-md mb-8 leading-relaxed">
        Oops! The page you are looking for doesn't exist or has been moved. Let's get you back on track.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-none justify-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-ctl bg-surface text-ink font-semibold text-sm border border-border shadow-card hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        <Link
          to={user ? '/today' : '/'}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-ctl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-cta transition"
        >
          <Home size={16} />
          {user ? 'Go to Dashboard' : 'Back to Home'}
        </Link>
      </div>

      {/* Brand Watermark */}
      <div className="mt-14 text-xs font-semibold text-muted tracking-wider uppercase">
        TaskFlow App
      </div>
    </div>
  );
};

export default NotFoundPage;
