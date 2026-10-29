'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ActivateInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no_token'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('no_token');
      return;
    }

    let isMounted = true;

    async function activate() {
      try {
        const res = await fetch(`/api/auth/activate?token=${encodeURIComponent(token!)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Your account has been activated successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to activate your account. The link may have expired.');
        }
      } catch {
        if (!isMounted) return;
        setStatus('error');
        setMessage('A network error occurred while activating your account. Please try again.');
      }
    }

    activate();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    setResendSuccess(null);
    setResendLoading(true);

    try {
      const res = await fetch('/api/auth/activate/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResendSuccess(data.message || 'Activation email sent! Please check your inbox.');
        setResendEmail('');
      } else {
        setResendError(data.error || 'Failed to send activation email.');
      }
    } catch {
      setResendError('A network error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-68px)] flex items-center justify-center w-full py-[4rem] px-[1.6rem]">
      <div className="w-full max-w-[480px] bg-white border border-slate-200/80 rounded-[1.4rem] p-[3rem_2rem] sm:p-[3.6rem_3rem] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] text-center">
        {status === 'loading' && (
          <div className="py-[2rem] flex flex-col items-center">
            <div className="w-[4.8rem] h-[4.8rem] border-4 border-[#c96742]/20 border-t-[#c96742] rounded-full animate-spin mb-[1.8rem]" />
            <h1 className="text-[2.2rem] font-bold text-[#0f172a] mb-[0.8rem]">
              Activating your account...
            </h1>
            <p className="text-[1.35rem] text-[#64748b] max-w-[36rem]">
              Please wait a moment while we verify your activation link.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-[1rem]">
            <div className="w-[6rem] h-[6rem] bg-[#ecfdf5] text-[#059669] rounded-full flex items-center justify-center mx-auto mb-[1.8rem] text-[2.8rem]">
              ✓
            </div>
            <h1 className="text-[2.2rem] font-bold text-[#0f172a] mb-[0.8rem]">
              Account Verified! 🎉
            </h1>
            <p className="text-[1.35rem] text-[#475569] leading-[1.6] mb-[2.4rem]">
              {message} You can now log in to access your orders, track shipments, and manage your account.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full h-[4.8rem] bg-[#111111] hover:bg-[#2a2a2a] text-white text-[1.45rem] font-semibold rounded-[0.75rem] transition-colors"
            >
              Log in to your account
            </Link>
          </div>
        )}

        {(status === 'error' || status === 'no_token') && (
          <div className="py-[1rem]">
            <div className="w-[6rem] h-[6rem] bg-[#fef2f2] text-[#dc2626] rounded-full flex items-center justify-center mx-auto mb-[1.8rem] text-[2.6rem]">
              !
            </div>
            <h1 className="text-[2.2rem] font-bold text-[#0f172a] mb-[0.8rem]">
              {status === 'no_token' ? 'Activation Token Missing' : 'Activation Failed'}
            </h1>
            <p className="text-[1.35rem] text-[#64748b] leading-[1.6] mb-[2.4rem]">
              {status === 'no_token'
                ? 'No activation link was detected. Please check the link in your email or enter your email below to request a new one.'
                : message}
            </p>

            <div className="bg-[#f8fafc] border border-slate-200/80 rounded-[1rem] p-[2rem] text-left mb-[2rem]">
              <h2 className="text-[1.35rem] font-semibold text-[#0f172a] mb-[0.6rem]">
                Resend Activation Link
              </h2>
              <p className="text-[1.2rem] text-[#64748b] mb-[1.2rem]">
                Enter your registered email address to receive a new activation link:
              </p>

              {resendSuccess && (
                <div className="bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] p-[0.9rem_1.2rem] rounded-[0.6rem] text-[1.25rem] mb-[1.2rem]">
                  {resendSuccess}
                </div>
              )}
              {resendError && (
                <div className="bg-[#fef2f2] border border-[#fee2e2] text-[#991b1b] p-[0.9rem_1.2rem] rounded-[0.6rem] text-[1.25rem] mb-[1.2rem]">
                  {resendError}
                </div>
              )}

              <form onSubmit={handleResend} className="flex flex-col gap-[1rem]">
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full h-[4.2rem] px-[1.2rem] border border-[#cbd5e1] rounded-[0.6rem] text-[1.35rem] text-[#0f172a] outline-none focus:border-[#c96742]"
                  disabled={resendLoading}
                />
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="h-[4.2rem] bg-[#c96742] hover:bg-[#b05835] text-white text-[1.35rem] font-semibold rounded-[0.6rem] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {resendLoading ? 'Sending...' : 'Send Activation Email'}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-center gap-[1.6rem] text-[1.3rem]">
              <Link href="/login" className="text-[#0f172a] font-semibold hover:underline">
                Back to Login
              </Link>
              <span className="text-[#cbd5e1]">&bull;</span>
              <Link href="/register" className="text-[#c96742] font-semibold hover:underline">
                Create an account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivatePageContent() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-50 min-h-[calc(100vh-68px)] flex items-center justify-center w-full py-[4rem]">
          <div className="w-[4.8rem] h-[4.8rem] border-4 border-[#c96742]/20 border-t-[#c96742] rounded-full animate-spin" />
        </div>
      }
    >
      <ActivateInner />
    </Suspense>
  );
}
