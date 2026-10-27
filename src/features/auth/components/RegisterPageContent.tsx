'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';


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

function IconUser() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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

export function RegisterPageContent() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (!input) {
      setPhone('');
      return;
    }

    // Only allow digits, leading '+', spaces, and hyphens
    let clean = input.replace(/[^\d+\s-]/g, '');
    if (clean.includes('+')) {
      clean = (clean.startsWith('+') ? '+' : '') + clean.replace(/\+/g, '');
    }

    const isPlus94 = clean.startsWith('+94');
    const isPlus = clean.startsWith('+');
    const digits = clean.replace(/\D/g, '');

    // Max digits allowed:
    // +94 (Sri Lanka): 11 digits total (country code 94 + 9 digits)
    // + (other international): max 13 digits
    // 0 (local Sri Lanka): 10 digits
    // other digits: 9 digits
    let maxDigits = 10;
    if (isPlus94) maxDigits = 11;
    else if (isPlus) maxDigits = 13;
    else if (!digits.startsWith('0')) maxDigits = 9;

    if (digits.length > maxDigits) {
      let count = 0;
      clean = clean
        .split('')
        .filter((char) => {
          if (/\d/.test(char)) {
            count++;
            return count <= maxDigits;
          }
          return true;
        })
        .join('');
    }

    setPhone(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setError('Please enter your phone number.');
      return;
    }

    const digits = trimmedPhone.replace(/\D/g, '');
    if (trimmedPhone.startsWith('+94')) {
      if (digits.length !== 11) {
        setError('Phone number must have 9 digits after +94 (e.g. +94 77 123 4567).');
        return;
      }
    } else if (trimmedPhone.startsWith('+')) {
      if (digits.length < 9 || digits.length > 13) {
        setError('Please enter a valid international phone number.');
        return;
      }
    } else if (digits.startsWith('0')) {
      if (digits.length !== 10) {
        setError('Phone number must be exactly 10 digits starting with 0 (e.g. 077 123 4567).');
        return;
      }
    } else if (digits.length !== 9) {
      setError('Please enter a valid phone number (e.g. 077 123 4567 or +94 77 123 4567).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms and Conditions.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to register account');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        useAuthStore.getState().setUser(data.user);
      }

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        router.push(redirectPath);
      }, 1200);
    } catch {
      setError('A network error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-68px)] flex items-center justify-center w-full py-[3rem] sm:py-[4.5rem] px-[1.2rem] sm:px-[1.6rem] box-border">
      <div className="w-full max-w-full flex justify-center items-center box-border">
        <div className="w-full max-w-[500px] mx-auto bg-white border border-slate-200/80 rounded-[1.4rem] p-[2.2rem_1.6rem] sm:p-[2.8rem_3.2rem] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] box-border">
          <div className="text-center mb-[1.6rem]">
            <span className="inline-block bg-[#fdf3ef] text-[#c96742] text-[1.05rem] font-bold tracking-[0.06em] px-[0.85rem] py-[0.2rem] rounded-[2rem] mb-[0.6rem] uppercase">
              JOIN US
            </span>
            <h1 className="text-[2rem] sm:text-[2.2rem] font-bold text-[#0f172a] tracking-[-0.01em] mb-[0.4rem] leading-[1.25]">
              Create your account
            </h1>
            <p className="text-[1.25rem] sm:text-[1.3rem] text-[#64748b] leading-[1.45] m-0">
              Sign up today for early sale access, order tracking, and faster checkout.
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

          {success && (
            <div className="bg-[#f0fdf4] border border-[#dcfce7] text-[#166534] p-[0.9rem_1.2rem] rounded-[0.8rem] text-[1.25rem] mb-[1.4rem] flex items-center gap-[0.8rem] leading-[1.4]" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <form className="flex flex-col gap-[1.2rem]" onSubmit={handleSubmit}>
            {/* Row 1: First + Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.2rem]">
              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[1.25rem] sm:text-[1.3rem] font-semibold text-[#1e293b]" htmlFor="reg-first-name">
                  First Name <span className="text-[#ef4444]">*</span>
                </label>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-[1.2rem] text-[#94a3b8] flex items-center pointer-events-none"><IconUser /></span>
                  <input
                    id="reg-first-name"
                    type="text"
                    required
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-[4.4rem] pl-[3.8rem] pr-[1.2rem] bg-white border border-[#cbd5e1] rounded-[0.75rem] text-[1.6rem] sm:text-[1.35rem] text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-[#c96742] focus:ring-2 focus:ring-[#c96742]/15 disabled:bg-[#f8fafc] disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[1.25rem] sm:text-[1.3rem] font-semibold text-[#1e293b]" htmlFor="reg-last-name">
                  Last Name
                </label>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-[1.2rem] text-[#94a3b8] flex items-center pointer-events-none"><IconUser /></span>
                  <input
                    id="reg-last-name"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-[4.4rem] pl-[3.8rem] pr-[1.2rem] bg-white border border-[#cbd5e1] rounded-[0.75rem] text-[1.6rem] sm:text-[1.35rem] text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-[#c96742] focus:ring-2 focus:ring-[#c96742]/15 disabled:bg-[#f8fafc] disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.2rem]">
              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[1.25rem] sm:text-[1.3rem] font-semibold text-[#1e293b]" htmlFor="reg-email">
                  Email Address <span className="text-[#ef4444]">*</span>
                </label>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-[1.2rem] text-[#94a3b8] flex items-center pointer-events-none"><IconMail /></span>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[4.4rem] pl-[3.8rem] pr-[1.2rem] bg-white border border-[#cbd5e1] rounded-[0.75rem] text-[1.6rem] sm:text-[1.35rem] text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-[#c96742] focus:ring-2 focus:ring-[#c96742]/15 disabled:bg-[#f8fafc] disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[1.25rem] sm:text-[1.3rem] font-semibold text-[#1e293b]" htmlFor="reg-phone">
                  Phone Number <span className="text-[#ef4444]">*</span>
                </label>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-[1.2rem] text-[#94a3b8] flex items-center pointer-events-none"><IconPhone /></span>
                  <input
                    id="reg-phone"
                    type="tel"
                    inputMode="tel"
                    maxLength={16}
                    autoComplete="tel"
                    required
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full h-[4.4rem] pl-[3.8rem] pr-[1.2rem] bg-white border border-[#cbd5e1] rounded-[0.75rem] text-[1.6rem] sm:text-[1.35rem] text-[#0f172a] placeholder-[#94a3b8] outline-none transition-all focus:border-[#c96742] focus:ring-2 focus:ring-[#c96742]/15 disabled:bg-[#f8fafc] disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Password */}
            <div className="flex flex-col gap-[0.4rem]">
              <label className="text-[1.25rem] sm:text-[1.3rem] font-semibold text-[#1e293b]" htmlFor="reg-password">
                Password <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative flex items-center w-full">
                <span className="absolute left-[1.2rem] text-[#94a3b8] flex items-center pointer-events-none"><IconLock /></span>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
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

            {/* Terms checkbox */}
            <div className="flex items-center -mt-[0.2rem]">
              <label className="inline-flex items-center gap-[0.8rem] text-[1.25rem] text-[#475569] cursor-pointer select-none py-[0.3rem]">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-[1.7rem] h-[1.7rem] accent-[#c96742] cursor-pointer shrink-0"
                />
                <span>
                  I agree to the{' '}
                  <Link href="/pages/terms-of-service" className="text-[#c96742] underline underline-offset-2 hover:text-[#a84e2c] font-medium">
                    Terms and Conditions
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-[4.6rem] bg-[#111111] hover:bg-[#2a2a2a] text-white text-[1.45rem] font-semibold rounded-[0.75rem] tracking-[0.01em] flex items-center justify-center transition-all duration-150 shadow-[0_3px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_5px_12px_rgba(0,0,0,0.14)] hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-[0.2rem]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-[0.8rem]">
                  <span className="w-[1.6rem] h-[1.6rem] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-[1.6rem] pt-[1.3rem] border-t border-slate-100 text-center text-[1.3rem] text-[#64748b] flex items-center justify-center gap-[0.7rem]">
            <span>Already have an account?</span>
            <Link
              href={redirectPath !== '/' ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login'}
              className="text-[#c96742] font-semibold hover:underline no-underline transition-colors"
            >
              Log in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

