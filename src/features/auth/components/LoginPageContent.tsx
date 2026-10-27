'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';


function IconMail() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function LoginPageContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string>('/');

  // Read redirect query parameter
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      if (redirect && redirect.startsWith('/')) {
        setRedirectPath(redirect);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid email or password');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        useAuthStore.getState().setUser(data.user);
      }

      router.push(redirectPath);
    } catch {
      setError('A network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-68px)] flex items-center justify-center w-full py-[3rem] sm:py-[4.5rem] px-[1.2rem] sm:px-[1.6rem] box-border">
      <div className="w-full max-w-full flex justify-center items-center box-border">
        <div className="w-full max-w-[440px] mx-auto bg-white border border-slate-200/80 rounded-[1.4rem] p-[2.2rem_1.6rem] sm:p-[3.2rem_3rem] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] box-border">
          {/* Header */}
          <div className="text-center mb-[2rem]">
            <span className="inline-block bg-[#fdf3ef] text-[#c96742] text-[1.05rem] font-bold tracking-[0.06em] px-[0.9rem] py-[0.25rem] rounded-[2rem] mb-[0.8rem] uppercase">
              WELCOME BACK
            </span>
            <h1 className="text-[2rem] sm:text-[2.2rem] font-bold text-[#0f172a] tracking-[-0.01em] mb-[0.5rem] leading-[1.25]">
              Log in to your account
            </h1>
            <p className="text-[1.25rem] sm:text-[1.3rem] text-[#64748b] leading-[1.45] m-0">
              Enter your credentials to manage your orders.
            </p>
          </div>

          {error && (
            <div className="bg-[#fef2f2] border border-[#fee2e2] text-[#991b1b] p-[0.9rem_1.2rem] rounded-[0.8rem] text-[1.25rem] mb-[1.4rem] flex items-center gap-[0.8rem] leading-[1.4]" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-[1.4rem]" noValidate>
            {/* Email Field */}
            <div className="flex flex-col gap-[0.5rem]">
              <label className="text-[1.25rem] sm:text-[1.3rem] font-semibold text-[#1e293b]" htmlFor="login-email">
                Email Address <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative flex items-center w-full">
                <span className="absolute left-[1.2rem] text-[#94a3b8] flex items-center pointer-events-none">
                  <IconMail />
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[4.4rem] pl-[3.8rem] pr-[1.4rem] bg-white border border-[#cbd5e1] rounded-[0.75rem] text-[1.6rem] sm:text-[1.35rem] text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-[#c96742] focus:ring-2 focus:ring-[#c96742]/15 disabled:bg-[#f8fafc] disabled:cursor-not-allowed"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-[0.5rem]">
              <div className="flex justify-between items-center">
                <label className="text-[1.25rem] sm:text-[1.3rem] font-semibold text-[#1e293b]" htmlFor="login-password">
                  Password <span className="text-[#ef4444]">*</span>
                </label>
                <Link href="/reset-password" className="text-[1.2rem] text-[#c96742] font-medium hover:underline transition-colors py-[0.2rem]">
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center w-full">
                <span className="absolute left-[1.2rem] text-[#94a3b8] flex items-center pointer-events-none">
                  <IconLock />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[4.4rem] pl-[3.8rem] pr-[4.2rem] bg-white border border-[#cbd5e1] rounded-[0.75rem] text-[1.6rem] sm:text-[1.35rem] text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-[#c96742] focus:ring-2 focus:ring-[#c96742]/15 disabled:bg-[#f8fafc] disabled:cursor-not-allowed"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-[0.6rem] min-w-[3.6rem] min-h-[3.6rem] text-[#94a3b8] hover:text-[#334155] rounded-[0.4rem] transition-colors disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center -mt-[0.2rem]">
              <label className="inline-flex items-center gap-[0.8rem] text-[1.25rem] text-[#475569] cursor-pointer select-none py-[0.3rem]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-[1.7rem] h-[1.7rem] accent-[#c96742] cursor-pointer shrink-0"
                />
                <span>Remember me on this browser</span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full h-[4.6rem] bg-[#111111] hover:bg-[#2a2a2a] text-white text-[1.45rem] font-semibold rounded-[0.75rem] tracking-[0.01em] flex items-center justify-center transition-all duration-150 shadow-[0_3px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-[0.2rem]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-[0.8rem]">
                  <span className="w-[1.6rem] h-[1.6rem] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Log in'
              )}
            </button>

            {/* Register below login button */}
            <div className="flex items-center gap-[1.2rem] my-[0.4rem]">
              <span className="flex-1 h-[1px] bg-[#e2e8f0]" />
              <span className="text-[1.15rem] text-[#64748b] font-medium">Don&apos;t have an account?</span>
              <span className="flex-1 h-[1px] bg-[#e2e8f0]" />
            </div>

            <Link
              href={redirectPath !== '/' ? `/register?redirect=${encodeURIComponent(redirectPath)}` : '/register'}
              className="inline-flex items-center justify-center gap-[0.7rem] w-full h-[4.4rem] bg-white text-[#0f172a] border border-[#cbd5e1] rounded-[0.75rem] text-[1.35rem] font-semibold hover:border-[#c96742] hover:text-[#c96742] hover:bg-[#fff9f6] transition-all duration-150 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_10px_rgba(201,103,66,0.1)] hover:-translate-y-[1px] active:translate-y-0 no-underline cursor-pointer"
            >
              <span>Register an Account</span>
              <IconArrowRight />
            </Link>

            <p className="text-[1.2rem] text-center text-[#64748b] mt-[1.2rem] m-0">
              By logging in, you agree to our{' '}
              <Link href="/pages/terms-of-service" className="text-[#c96742] underline underline-offset-2 hover:text-[#a84e2c] font-medium">
                Terms and Conditions
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

