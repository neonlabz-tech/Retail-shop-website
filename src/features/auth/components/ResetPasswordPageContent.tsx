'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Mode A: Request Reset states
  const [email, setEmail] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Mode B: Set New Password states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  // Pre-validate token if present
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    async function checkToken() {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token!)}`);
        const data = await res.json();
        if (isMounted) {
          if (res.ok && data.valid) {
            setIsTokenValid(true);
          } else {
            setIsTokenValid(false);
            setResetError(data.error || 'This password reset link is invalid or has expired.');
          }
        }
      } catch {
        if (isMounted) {
          setIsTokenValid(false);
          setResetError('Unable to verify reset link. Please try again.');
        }
      }
    }

    checkToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle forgot password request submission
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError(null);
    setRequestSuccess(null);
    setIsRequesting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRequestSuccess(
          data.message || 'If an account exists with this email, a password reset link has been sent.'
        );
        setEmail('');
      } else {
        setRequestError(data.error || 'Failed to process request.');
      }
    } catch {
      setRequestError('A network error occurred. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  // Handle password reset submission
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (password.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsResetting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResetSuccess(data.message || 'Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setResetError(data.error || 'Failed to reset password. Link may have expired.');
      }
    } catch {
      setResetError('A network error occurred. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-68px)] flex items-center justify-center w-full py-[3rem] sm:py-[4.5rem] px-[1.2rem] sm:px-[1.6rem] box-border">
      <div className="w-full max-w-full flex justify-center items-center box-border">
        <div className="w-full max-w-[440px] mx-auto bg-white border border-slate-200/80 rounded-[1.4rem] p-[2.2rem_1.6rem] sm:p-[3.2rem_3rem] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] box-border">
          {token ? (
            /* Mode B: Set New Password */
            <>
              {/* Header */}
              <div className="text-center mb-[2rem]">
                <span className="inline-block bg-[#fdf3ef] text-[#c96742] text-[1.05rem] font-bold tracking-[0.06em] px-[0.9rem] py-[0.25rem] rounded-[2rem] mb-[0.8rem] uppercase">
                  CREATE NEW PASSWORD
                </span>
                <h1 className="text-[2rem] sm:text-[2.2rem] font-bold text-[#0f172a] tracking-[-0.01em] mb-[0.5rem] leading-[1.25]">
                  Set new password
                </h1>
                <p className="text-[1.25rem] sm:text-[1.3rem] text-[#64748b] leading-[1.45] m-0">
                  Enter your new password below (at least 6 characters).
                </p>
              </div>

              {resetSuccess && (
                <div className="bg-[#f0fdf4] border border-[#dcfce7] text-[#166534] p-[1.1rem_1.3rem] rounded-[0.8rem] text-[1.25rem] mb-[1.4rem] leading-[1.4] flex items-center gap-[0.8rem]">
                  <span className="text-[1.6rem] leading-none shrink-0">✓</span>
                  <span>{resetSuccess}</span>
                </div>
              )}

              {resetError && (
                <div className="bg-[#fef2f2] border border-[#fee2e2] text-[#991b1b] p-[1.1rem_1.3rem] rounded-[0.8rem] text-[1.25rem] mb-[1.4rem] flex items-center gap-[0.8rem] leading-[1.4]" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{resetError}</span>
                </div>
              )}

              {isTokenValid === false ? (
                <div className="flex flex-col gap-[1.2rem] mt-[1rem]">
                  <Link
                    href="/reset-password"
                    className="w-full h-[4.6rem] bg-[#111111] hover:bg-[#c96742] text-white text-[1.4rem] font-semibold rounded-[0.75rem] flex items-center justify-center transition-all duration-150 shadow-[0_3px_8px_rgba(0,0,0,0.08)] no-underline"
                  >
                    Request a New Reset Link
                  </Link>
                  <div className="text-center pt-[0.6rem]">
                    <Link href="/login" className="text-[1.3rem] text-[#64748b] hover:text-[#c96742] hover:underline">
                      Back to Log in
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="flex flex-col gap-[1.4rem]" noValidate>
                  {/* New Password Field */}
                  <div className="flex flex-col gap-[0.5rem]">
                    <label className="text-[1.25rem] sm:text-[1.3rem] font-semibold text-[#1e293b]" htmlFor="new-password">
                      New Password <span className="text-[#ef4444]">*</span>
                    </label>
                    <div className="relative flex items-center w-full">
                      <span className="absolute left-[1.2rem] text-[#94a3b8] flex items-center pointer-events-none">
                        <IconLock />
                      </span>
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 6 characters"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-[4.4rem] pl-[3.8rem] pr-[4.2rem] bg-white border border-[#cbd5e1] rounded-[0.75rem] text-[1.6rem] sm:text-[1.35rem] text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-[#c96742] focus:ring-2 focus:ring-[#c96742]/15 disabled:bg-[#f8fafc] disabled:cursor-not-allowed"
                        disabled={isResetting}
                      />
                      <button
                        type="button"
                        className="absolute right-[0.6rem] min-w-[3.6rem] min-h-[3.6rem] text-[#94a3b8] hover:text-[#334155] rounded-[0.4rem] transition-colors cursor-pointer flex items-center justify-center"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        disabled={isResetting}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="flex flex-col gap-[0.5rem]">
                    <label className="text-[1.25rem] sm:text-[1.3rem] font-semibold text-[#1e293b]" htmlFor="confirm-password">
                      Confirm Password <span className="text-[#ef4444]">*</span>
                    </label>
                    <div className="relative flex items-center w-full">
                      <span className="absolute left-[1.2rem] text-[#94a3b8] flex items-center pointer-events-none">
                        <IconLock />
                      </span>
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-[4.4rem] pl-[3.8rem] pr-[4.2rem] bg-white border border-[#cbd5e1] rounded-[0.75rem] text-[1.6rem] sm:text-[1.35rem] text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-[#c96742] focus:ring-2 focus:ring-[#c96742]/15 disabled:bg-[#f8fafc] disabled:cursor-not-allowed"
                        disabled={isResetting}
                      />
                      <button
                        type="button"
                        className="absolute right-[0.6rem] min-w-[3.6rem] min-h-[3.6rem] text-[#94a3b8] hover:text-[#334155] rounded-[0.4rem] transition-colors cursor-pointer flex items-center justify-center"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        disabled={isResetting}
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full h-[4.6rem] bg-[#111111] hover:bg-[#2a2a2a] text-white text-[1.45rem] font-semibold rounded-[0.75rem] tracking-[0.01em] flex items-center justify-center transition-all duration-150 shadow-[0_3px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-[0.4rem]"
                  >
                    {isResetting ? (
                      <span className="flex items-center gap-[0.8rem]">
                        <span className="w-[1.6rem] h-[1.6rem] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving password...
                      </span>
                    ) : (
                      'Save New Password'
                    )}
                  </button>

                  <div className="text-center pt-[1rem] border-t border-slate-100">
                    <Link href="/login" className="text-[1.3rem] text-[#64748b] hover:text-[#c96742] hover:underline transition-colors">
                      Back to Log in
                    </Link>
                  </div>
                </form>
              )}
            </>
          ) : (
            /* Mode A: Request Reset */
            <>
              {/* Header */}
              <div className="text-center mb-[2rem]">
                <span className="inline-block bg-[#fdf3ef] text-[#c96742] text-[1.05rem] font-bold tracking-[0.06em] px-[0.9rem] py-[0.25rem] rounded-[2rem] mb-[0.8rem] uppercase">
                  FORGOT PASSWORD
                </span>
                <h1 className="text-[2rem] sm:text-[2.2rem] font-bold text-[#0f172a] tracking-[-0.01em] mb-[0.5rem] leading-[1.25]">
                  Reset your password
                </h1>
                <p className="text-[1.25rem] sm:text-[1.3rem] text-[#64748b] leading-[1.45] m-0">
                  Enter your email and we&apos;ll send you a secure link to reset your password.
                </p>
              </div>

              {requestSuccess && (
                <div className="bg-[#f0fdf4] border border-[#dcfce7] text-[#166534] p-[1.2rem_1.4rem] rounded-[0.8rem] text-[1.25rem] mb-[1.6rem] leading-[1.5] flex items-start gap-[0.8rem]">
                  <span className="text-[1.6rem] leading-none shrink-0">✉️</span>
                  <div>
                    <p className="font-semibold text-[#14532d] mb-[0.2rem]">Reset link sent!</p>
                    <p className="m-0 text-[#166534]">{requestSuccess}</p>
                  </div>
                </div>
              )}

              {requestError && (
                <div className="bg-[#fef2f2] border border-[#fee2e2] text-[#991b1b] p-[1.1rem_1.3rem] rounded-[0.8rem] text-[1.25rem] mb-[1.4rem] flex items-center gap-[0.8rem] leading-[1.4]" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{requestError}</span>
                </div>
              )}

              <form className="flex flex-col gap-[1.4rem]" onSubmit={handleForgotSubmit} noValidate>
                {/* Email Field */}
                <div className="flex flex-col gap-[0.5rem]">
                  <label className="text-[1.25rem] sm:text-[1.3rem] font-semibold text-[#1e293b]" htmlFor="reset-email">
                    Email Address <span className="text-[#ef4444]">*</span>
                  </label>
                  <div className="relative flex items-center w-full">
                    <span className="absolute left-[1.2rem] text-[#94a3b8] flex items-center pointer-events-none">
                      <IconMail />
                    </span>
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[4.4rem] pl-[3.8rem] pr-[1.4rem] bg-white border border-[#cbd5e1] rounded-[0.75rem] text-[1.6rem] sm:text-[1.35rem] text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-[#c96742] focus:ring-2 focus:ring-[#c96742]/15 disabled:bg-[#f8fafc] disabled:cursor-not-allowed"
                      disabled={isRequesting}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isRequesting}
                  className="w-full h-[4.6rem] bg-[#111111] hover:bg-[#2a2a2a] text-white text-[1.45rem] font-semibold rounded-[0.75rem] tracking-[0.01em] flex items-center justify-center transition-all duration-150 shadow-[0_3px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-[0.4rem]"
                >
                  {isRequesting ? (
                    <span className="flex items-center gap-[0.8rem]">
                      <span className="w-[1.6rem] h-[1.6rem] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending reset link...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* Footer links */}
              <div className="mt-[2rem] pt-[1.6rem] border-t border-slate-100 flex flex-col gap-[0.8rem] text-center text-[1.3rem] text-[#64748b]">
                <div>
                  Remember your password?{' '}
                  <Link href="/login" className="text-[#c96742] font-semibold hover:underline">
                    Log in
                  </Link>
                </div>
                <div>
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-[#0f172a] font-semibold hover:text-[#c96742] hover:underline transition-colors">
                    Create an account
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordPageContent() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-50 min-h-[calc(100vh-68px)] flex items-center justify-center w-full">
          <div className="w-[4.4rem] h-[4.4rem] border-4 border-[#c96742]/20 border-t-[#c96742] rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
