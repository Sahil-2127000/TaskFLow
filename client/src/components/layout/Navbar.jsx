import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Check, Home } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (

    <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">

      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2.5 group">

        {/* Logo Icon */}
        <div className="w-8.5 h-8.5 rounded-[9px] bg-brand flex items-center justify-center text-white shadow-sm group-hover:bg-brand-hover transition">
          <Check size={22} strokeWidth={3} />
        </div>

        {/* Logo Text */}
        <span className="text-xl font-extrabold text-ink tracking-tight">
          TaskFlow
        </span>

      </Link>

      {/* Navigation Actions */}
      <nav className="flex items-center gap-2.5 sm:gap-4">

        {/* On home page */}
        {pathname === '/' && (
          <>
          <Link
            to="/login"
            className="px-4.5 py-2 rounded-ctl bg-surface text-ink font-semibold text-sm border border-border shadow-card hover:bg-gray-50 transition"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="px-5 py-2 rounded-ctl bg-brand hover:bg-brand-hover text-white font-semibold text-sm shadow-cta transition"
          >
            Sign Up
          </Link>
          
          </>
          
        )}


        {/* On Login page: Provide Home button and link to Sign Up */}
        {pathname === '/login' && (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-ctl text-muted hover:text-ink font-semibold text-xs sm:text-sm hover:bg-gray-100 transition"
            >
              <Home size={16} />
              <span>Home</span>
            </Link>

            <span className="hidden sm:inline text-xs sm:text-sm text-muted">
              Don't have an account?
            </span>
            <Link
              to="/signup"
              className="px-4.5 sm:px-5 py-2 rounded-ctl bg-brand hover:bg-brand-hover text-white font-semibold text-xs sm:text-sm shadow-cta transition"
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* On Signup page: Provide Home button and link to Login */}
        {pathname === '/signup' && (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-ctl text-muted hover:text-ink font-semibold text-xs sm:text-sm hover:bg-gray-100 transition"
            >
              <Home size={16} />
              <span>Home</span>
            </Link>

            <span className="hidden sm:inline text-xs sm:text-sm text-muted">
              Already have an account?
            </span>
            <Link
              to="/login"
              className="px-4 sm:px-4.5 py-2 rounded-ctl bg-surface text-ink font-semibold text-xs sm:text-sm border border-border shadow-card hover:bg-gray-50 transition"
            >
              Login
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
