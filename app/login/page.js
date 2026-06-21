"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { authService, roleConfig } from '../../lib/auth';
import MobileLoginView from '../../mobile_views/login/MobileLoginView';
import useResponsive from '@/hooks/useResponsive';
import LoginPromoSection from '@/components/LoginPromoSection';

function LoginForm() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('portal') || 'student';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' });

  // Responsive state
  const isMobileOrTablet = useResponsive(); // < 1024px → mobile layout

  // Update role if query param changes
  useEffect(() => {
    if (searchParams.get('portal')) {
      const p = searchParams.get('portal');
      if (roleConfig[p]) setRole(p);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authService.loginByRole(role, email, password);
      if (result.success) {
        setRole(result.resolvedRole);
        // Save the authenticated user's portal role to localStorage
        localStorage.setItem("portalRole", result.resolvedRole);
        window.location.href = result.redirectUrl || "/student/dashboard";
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
      setLoading(false); // Only stop loading if error occurs; otherwise wait for redirect
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage({ type: '', text: '' });

    try {
      await authService.forgotPassword(role, forgotEmail);
      setForgotMessage({ type: 'success', text: 'Password reset instructions have been sent to your email.' });
      setTimeout(() => {
        setShowForgot(false);
        setForgotMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      setForgotMessage({ type: 'error', text: err.message || 'Failed to send reset email.' });
    } finally {
      setForgotLoading(false);
    }
  };

  const canResetPassword = role === 'student' || role === 'tpo';

  if (isMobileOrTablet) {
    return (
      <MobileLoginView
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        role={role}
        setRole={setRole}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        loading={loading}
        error={error}
        showForgot={showForgot}
        setShowForgot={setShowForgot}
        forgotEmail={forgotEmail}
        setForgotEmail={setForgotEmail}
        forgotLoading={forgotLoading}
        forgotMessage={forgotMessage}
        handleSubmit={handleSubmit}
        handleForgotPassword={handleForgotPassword}
        canResetPassword={canResetPassword}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-900 overflow-hidden relative">

      {/* FULL-SCREEN LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-300">
          <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-[4px] border-gray-100"></div>
            <div className="absolute inset-0 rounded-full border-[4px] border-brand-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 rounded-full border-[4px] border-brand-400 border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
          </div>
          <h3 className="text-2xl font-bold text-brand-900 animate-pulse tracking-tight">Signing you in…</h3>
          <p className="mt-2 text-gray-500 font-medium">Securing your {role === 'student' && !searchParams.get('portal') ? '' : roleConfig[role]?.name + ' '}session...</p>
        </div>
      )}

      {/* LEFT COLUMN - FORM */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative bg-white z-10 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 flex items-center">
          <img src="https://res.cloudinary.com/dug3awue8/image/upload/v1744626297/icon_dtclq9.svg" alt="SkillMedha Logo" className="h-8 w-auto mr-3 hover:scale-105 transition-transform cursor-pointer" />
          <div className="text-2xl font-extrabold tracking-tighter flex items-center text-gray-900 cursor-pointer">
            SKILLMEDHA
          </div>
        </div>

        <div className="w-full max-w-md mx-auto mt-16 sm:mt-12 lg:mt-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mb-10 text-[15px] font-medium">Please enter your details to sign in.</p>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start animate-in fade-in slide-in-from-top-2 duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* INPUT FIELDS */}
            <div className="space-y-4">
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full px-5 pt-7 pb-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all text-[15px] text-gray-900 placeholder-transparent font-medium"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
                <label htmlFor="email" className="absolute left-5 top-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide transition-all peer-placeholder-shown:text-[14px] peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-brand-600 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wide">Email Address</label>
              </div>

              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full px-5 pt-7 pb-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all text-[15px] text-gray-900 placeholder-transparent font-medium pr-12"
                  placeholder="Password"
                  required
                  disabled={loading}
                />
                <label htmlFor="password" className="absolute left-5 top-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide transition-all peer-placeholder-shown:text-[14px] peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-brand-600 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wide">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-brand-600 focus:outline-none transition-colors rounded-full hover:bg-brand-50"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-brand-600/20 focus:outline-none checked:bg-brand-600 checked:border-brand-600 transition-all cursor-pointer" />
                  <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="ml-3 text-[14px] font-medium text-gray-500 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>

              {canResetPassword && (
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-[14px] text-brand-600 font-bold hover:text-brand-800 transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-4 rounded-2xl mt-8 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 shadow-[0_10px_20px_-10px_rgba(30,27,75,0.4)] hover:shadow-[0_15px_25px_-10px_rgba(30,27,75,0.5)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Sign In to SkillMedha
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN - ANIMATED BRANDING */}
      <LoginPromoSection />

      {/* FORGOT PASSWORD MODAL */}
      {showForgot && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
              <button
                onClick={() => setShowForgot(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-500 mb-8 font-medium">Enter your email address and we'll send you a link to reset your password securely.</p>

            {forgotMessage.text && (
              <div className={`mb-6 p-4 rounded-2xl text-sm flex items-start font-medium animate-in fade-in slide-in-from-top-2 ${forgotMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                {forgotMessage.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                )}
                <span>{forgotMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="relative group">
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="peer w-full px-5 pt-7 pb-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all text-[15px] text-gray-900 placeholder-transparent font-medium"
                  placeholder="name@example.com"
                  required
                  disabled={forgotLoading}
                />
                <label htmlFor="forgot-email" className="absolute left-5 top-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide transition-all peer-placeholder-shown:text-[14px] peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-brand-600 peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wide">Email Address</label>
              </div>
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-4 rounded-2xl transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 shadow-[0_10px_20px_-10px_rgba(30,27,75,0.4)] hover:shadow-[0_15px_25px_-10px_rgba(30,27,75,0.5)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {forgotLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UnifiedLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-brand-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Loading Portal...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
