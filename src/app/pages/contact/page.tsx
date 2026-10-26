'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  STORE_EMAIL,
  STORE_PHONE,
  STORE_ADDRESS,
  STORE_HOURS,
  STORE_FACEBOOK,
  STORE_INSTAGRAM,
  STORE_TIKTOK,
} from '@/lib/constants';

/* ── Contact & Form Icons ── */
function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconArrowTriangle() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e0b870" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="6 4 18 12 6 20 6 4" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 16.9913 5.65783 21.1283 10.4385 21.8785V14.8906H7.89941V12H10.4385V9.79688C10.4385 7.29063 11.9314 5.90625 14.2156 5.90625C15.3097 5.90625 16.4541 6.10156 16.4541 6.10156V8.5625H15.1931C13.9509 8.5625 13.5635 9.33334 13.5635 10.1242V12H16.3369L15.8936 14.8906H13.5635V21.8785C18.3441 21.1283 22.001 16.9913 22.001 12C22.001 6.47715 17.5238 2 12.001 2Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.001 9C10.3436 9 9.00098 10.3431 9.00098 12C9.00098 13.6573 10.3441 15 12.001 15C13.6583 15 15.001 13.6569 15.001 12C15.001 10.3427 13.6579 9 12.001 9ZM12.001 7C14.7614 7 17.001 9.2371 17.001 12C17.001 14.7605 14.7639 17 12.001 17C9.24051 17 7.00098 14.7629 7.00098 12C7.00098 9.23953 9.23808 7 12.001 7ZM18.501 6.74915C18.501 7.43926 17.9402 7.99917 17.251 7.99917C16.5609 7.99917 16.001 7.4384 16.001 6.74915C16.001 6.0599 16.5617 5.5 17.251 5.5C17.9393 5.49913 18.501 6.0599 18.501 6.74915ZM12.001 4C9.5265 4 9.12318 4.00655 7.97227 4.0578C7.18815 4.09461 6.66253 4.20007 6.17416 4.38967C5.74016 4.55799 5.42709 4.75898 5.09352 5.09255C4.75867 5.4274 4.55804 5.73963 4.3904 6.17383C4.20036 6.66332 4.09493 7.18811 4.05878 7.97115C4.00703 9.0752 4.00098 9.46105 4.00098 12C4.00098 14.4745 4.00753 14.8778 4.05877 16.0286C4.0956 16.8124 4.2012 17.3388 4.39034 17.826C4.5591 18.2606 4.7605 18.5744 5.09246 18.9064C5.42863 19.2421 5.74179 19.4434 6.17187 19.6094C6.66619 19.8005 7.19148 19.9061 7.97227 19.9422C9.07618 19.9939 9.46203 20 12.001 20C14.4755 20 14.8788 19.9934 16.0296 19.9422C16.8117 19.9055 17.3385 19.7996 17.827 19.6106C18.2604 19.4423 18.5752 19.2402 18.9074 18.9085C19.2436 18.5718 19.4445 18.2594 19.6107 17.8283C19.8013 17.3358 19.9071 16.8098 19.9432 16.0289C19.9949 14.9248 20.001 14.5389 20.001 12C20.001 9.52552 19.9944 9.12221 19.9432 7.97137C19.9064 7.18906 19.8005 6.66149 19.6113 6.17318C19.4434 5.74038 19.2417 5.42635 18.9084 5.09255C18.573 4.75715 18.2616 4.55693 17.8271 4.38942C17.338 4.19954 16.8124 4.09396 16.0298 4.05781C14.9258 4.00605 14.5399 4 12.001 4ZM12.001 2C14.7176 2 15.0568 2.01 16.1235 2.06C17.1876 2.10917 17.9135 2.2775 18.551 2.525C19.2101 2.77917 19.7668 3.1225 20.3226 3.67833C20.8776 4.23417 21.221 4.7925 21.476 5.45C21.7226 6.08667 21.891 6.81333 21.941 7.8775C21.9885 8.94417 22.001 9.28333 22.001 12C22.001 14.7167 21.991 15.0558 21.941 16.1225C21.8918 17.1867 21.7226 17.9125 21.476 18.55C21.2218 19.2092 20.8776 19.7658 20.3226 20.3217C19.7668 20.8767 19.2076 21.22 18.551 21.475C17.9135 21.7217 17.1876 21.89 16.1235 21.94C15.0568 21.9875 14.7176 22 12.001 22C9.28431 22 8.94514 21.99 7.87848 21.94C6.81431 21.8908 6.08931 21.7217 5.45098 21.475C4.79264 21.2208 4.23514 20.8767 3.67931 20.3217C3.12348 19.7658 2.78098 19.2067 2.52598 18.55C2.27848 17.9125 2.11098 17.1867 2.06098 16.1225C2.01348 15.0558 2.00098 14.7167 2.00098 12C2.00098 9.28333 2.01098 8.94417 2.06098 7.8775C2.11014 6.8125 2.27848 6.0875 2.52598 5.45C2.78014 4.79167 3.12348 4.23417 3.67931 3.67833C4.23514 3.1225 4.79348 2.78 5.45098 2.525C6.08848 2.2775 6.81348 2.11 7.87848 2.06C8.94514 2.0125 9.28431 2 12.001 2Z" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8.24537V15.5C16 19.0899 13.0899 22 9.5 22C5.91015 22 3 19.0899 3 15.5C3 11.9101 5.91015 9 9.5 9C10.0163 9 10.5185 9.06019 11 9.17393V12.3368C10.5454 12.1208 10.0368 12 9.5 12C7.567 12 6 13.567 6 15.5C6 17.433 7.567 19 9.5 19C11.433 19 13 17.433 13 15.5V2H16C16 4.76142 18.2386 7 21 7V10C19.1081 10 17.3696 9.34328 16 8.24537Z" />
    </svg>
  );
}

export default function ContactPage() {
  const mapQuery = encodeURIComponent(`${STORE_ADDRESS}, Sri Lanka`);
  const storeMapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const storeMapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const accessKey = (process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || '').trim();

    // Redundant backup: save to MongoDB collection via /api/contact in the background
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fullName, email, phone, comment }),
    }).catch((err) => console.warn('Internal DB log backup warning:', err));

    // Check if Web3Forms key is configured
    if (!accessKey) {
      setIsSubmitting(false);
      // If no key is set yet, we inform the user/developer clearly
      setErrorMessage(
        'Web3Forms access key is not configured. Please add NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY to your .env.local file (get your free key from https://web3forms.com).'
      );
      return;
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: fullName,
          email: email,
          phone: phone,
          message: comment,
          subject: `New Contact Inquiry from ${fullName} - RKF Distributors`,
          from_name: 'RKF Distributors Website',
          botcheck: '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.message || 'Submission failed. Please check your Web3Forms access key and try again.');
      }
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setErrorMessage(err?.message || 'Network error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fa-contact-page-bg">
      <div className="fa-contact-canvas">
        {/* Breadcrumb */}
        

        {/* ── TOP SECTION: Let's Get In Touch ── */}
        <div className="fa-contact-top">
          <h1 className="fa-contact-title">Let&apos;s Get In Touch</h1>

          <div className="fa-contact-info-grid">
            {/* Phone Column */}
            <div className="fa-info-col">
              <div className="fa-info-icon-box">
                <IconPhone />
              </div>
              <div className="fa-info-text-group">
                <a href={`tel:${STORE_PHONE.replace(/\s+/g, '')}`} className="fa-info-link">
                  {STORE_PHONE}
                </a>
                <span className="fa-info-sub">9:00 AM – 6:00 PM (All Days)</span>
              </div>
            </div>

            {/* Email Column */}
            <div className="fa-info-col">
              <div className="fa-info-icon-box">
                <IconEmail />
              </div>
              <div className="fa-info-text-group">
                <a href={`mailto:${STORE_EMAIL}`} className="fa-info-link">
                  {STORE_EMAIL}
                </a>
                <span className="fa-info-sub">Fast response within 24h</span>
              </div>
            </div>

            {/* Location Column */}
            <div className="fa-info-col">
              <div className="fa-info-icon-box">
                <IconLocation />
              </div>
              <div className="fa-info-text-group">
                <span className="fa-info-link-static">{STORE_ADDRESS}</span>
                <span className="fa-info-sub">Open all days: 9:00 AM – 6:00 PM</span>
              </div>
            </div>
          </div>
            <section className="fa-map-section" aria-label="RKF Distributors location">
              <div className="fa-map-heading">
                <div>
                  <h2 className="fa-map-title">Visit RKF Distributors</h2>
                  <a
                    href={storeMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fa-map-address"
                  >
                    {STORE_ADDRESS}
                  </a>
                </div>
                <a
                  href={storeMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fa-map-directions"
                >
                  Get directions
                </a>
              </div>
              <iframe
                title="Map to RKF Distributors in Kopay South, Jaffna"
                src={storeMapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="fa-map-frame"
              />
            </section>
        </div>

        {/* Thin Divider Line */}
        <hr className="fa-contact-hr" />

        {/* ── BOTTOM SECTION: Form ── */}
        <div className="fa-contact-bottom">
          

          {submitted ? (
            <div className="fa-success-box">
              <div className="fa-success-icon-wrap">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#13382c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-[#13382c] mb-1">Message Sent Successfully!</h3>
                <p className="text-[14px] text-[#5a6660]">
                  Thank you for reaching out to RKF Distributors. Our team will review your inquiry and get back to you shortly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setErrorMessage('');
                  setFullName('');
                  setEmail('');
                  setPhone('');
                  setComment('');
                }}
                className="fa-success-reset-btn"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="fa-form-grid">
              {/* Web3Forms Honeypot Spam Prevention */}
              <input
                type="checkbox"
                name="botcheck"
                className="hidden"
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Error Alert */}
              {errorMessage && (
                <div className="fa-error-box">
                  <div className="fa-error-icon-wrap">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="fa-error-text">
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Row 1: Full Name + Email Address */}
              <div className="fa-field-group">
                <label className="fa-field-label">
                  Full Name<span className="fa-required">*</span>
                </label>
                <div className="fa-input-wrap">
                  <span className="fa-input-icon"><IconUser /></span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name..."
                    className="fa-input"
                  />
                </div>
              </div>

              <div className="fa-field-group">
                <label className="fa-field-label">
                  Email Address<span className="fa-required">*</span>
                </label>
                <div className="fa-input-wrap">
                  <span className="fa-input-icon"><IconEmail /></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address..."
                    className="fa-input"
                  />
                </div>
              </div>

              {/* Row 2: Phone Number (Full Width) */}
              <div className="fa-field-group fa-field-full">
                <label className="fa-field-label">
                  Phone Number<span className="fa-required">*</span>
                </label>
                <div className="fa-input-wrap">
                  <span className="fa-input-icon"><IconPhone /></span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="Enter your phone number..."
                    className="fa-input"
                  />
                </div>
              </div>

              {/* Row 3: Comments (Full Width) */}
              <div className="fa-field-group fa-field-full">
                <label className="fa-field-label">
                  Comments<span className="fa-required">*</span>
                </label>
                <div className="fa-input-wrap fa-textarea-wrap">
                  <span className="fa-input-icon fa-textarea-icon"><IconMessage /></span>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Enter your comments here..."
                    className="fa-input fa-textarea"
                  />
                </div>
              </div>

              {/* Row 4: Submit Button (Right-Aligned) */}
              <div className="fa-submit-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="fa-submit-btn"
                >
                  <span>{isSubmitting ? 'Sending...' : 'Submit Form'}</span>
                  <IconArrowTriangle />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        /* ── Page Canvas with Warm Natural Tone ── */
        .fa-contact-page-bg {
          background-color: #FAF8F5;
          min-height: calc(100vh - 160px);
          padding: 48px 20px 96px;
        }
        .fa-contact-canvas {
          max-width: 760px;
          margin: 0 auto;
        }

        /* ── Breadcrumb ── */
        .fa-contact-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #7d8a83;
          margin-bottom: 24px;
        }

        /* ── Top Section ── */
        .fa-contact-top {
          margin-bottom: 38px;
        }
        .fa-contact-title {
          font-size: 40px;
          font-weight: 700;
          color: #13382c;
          letter-spacing: -0.025em;
          margin: 0 0 32px;
          line-height: 1.15;
        }
        .fa-contact-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .fa-info-col {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .fa-info-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          border: 1px solid #E2DED8;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #13382c;
          margin-bottom: 14px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }
        .fa-info-text-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .fa-info-link {
          font-size: 14px;
          font-weight: 500;
          color: #13382c;
          text-decoration: none;
          transition: color 150ms ease;
          word-break: break-word;
        }
        .fa-info-link:hover {
          color: #000000;
          text-decoration: underline;
        }
        .fa-info-link-static {
          font-size: 14px;
          font-weight: 600;
          color: #13382c;
        }
        .fa-info-sub {
          font-size: 13px;
          color: #718079;
        }
        .fa-info-socials {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
        }
        .fa-info-socials a {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid #E2DED8;
          background: #FFFFFF;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #13382c;
          transition: all 180ms ease;
        }
        .fa-info-socials a:hover {
          background: #13382c;
          color: #FFFFFF;
          border-color: #13382c;
          transform: translateY(-1px);
        }
        .fa-map-section {
          margin-top: 30px;
          overflow: hidden;
          border: 1px solid #E2DED8;
          border-radius: 10px;
          background: #FFFFFF;
        }
        .fa-map-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 18px;
        }
        .fa-map-title {
          margin: 0 0 4px;
          color: #13382c;
          font-size: 16px;
          font-weight: 700;
        }
        .fa-map-address {
          color: #718079;
          font-size: 13px;
          text-decoration: none;
        }
        .fa-map-address:hover {
          color: #13382c;
          text-decoration: underline;
        }
        .fa-map-directions {
          flex-shrink: 0;
          border-radius: 6px;
          background: #13382c;
          color: #FFFFFF;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
        }
        .fa-map-directions:hover {
          background: #0c241c;
        }
        .fa-map-frame {
          display: block;
          width: 100%;
          height: 320px;
          border: 0;
        }

        /* ── Divider Line ── */
        .fa-contact-hr {
          border: none;
          border-top: 1px solid #E5E0D8;
          margin: 0 0 38px;
        }

        /* ── Bottom Section: Form ── */
        .fa-contact-bottom {
          width: 100%;
        }
        .fa-contact-form-heading {
          font-size: 26px;
          font-weight: 700;
          color: #13382c;
          letter-spacing: -0.015em;
          margin: 0 0 28px;
        }
        .fa-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 24px;
        }
        .fa-field-group {
          display: flex;
          flex-direction: column;
        }
        .fa-field-full {
          grid-column: 1 / -1;
        }
        .fa-field-label {
          font-size: 13.5px;
          font-weight: 600;
          color: #13382c;
          margin-bottom: 7px;
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .fa-required {
          color: #13382c;
          font-weight: 700;
        }

        /* ── Input Box with Embedded Icon ── */
        .fa-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .fa-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #718079;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 2;
        }
        .fa-textarea-wrap {
          align-items: flex-start;
        }
        .fa-textarea-icon {
          top: 14px;
          transform: none;
        }
        .fa-input {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 42px;
          background: #FFFFFF;
          border: 1px solid #E2DED8;
          border-radius: 6px;
          font-size: 14px;
          color: #13382c;
          outline: none;
          box-sizing: border-box;
          transition: border-color 160ms ease, box-shadow 160ms ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          font-family: inherit;
        }
        .fa-input::placeholder {
          color: #9AA6A0;
          font-size: 13.5px;
        }
        .fa-input:focus {
          border-color: #13382c;
          box-shadow: 0 0 0 3px rgba(19, 56, 44, 0.12);
        }
        .fa-textarea {
          height: auto;
          min-height: 120px;
          padding: 13px 16px 13px 42px;
          resize: vertical;
          line-height: 1.5;
        }

        /* ── Submit Row (Right Aligned) ── */
        .fa-submit-row {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }
        .fa-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background-color: #13382c;
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 26px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
          box-shadow: 0 2px 8px rgba(19, 56, 44, 0.18);
        }
        .fa-submit-btn:hover {
          background-color: #0c241c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(19, 56, 44, 0.25);
        }
        .fa-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        /* ── Success Feedback ── */
        .fa-success-box {
          background: #FFFFFF;
          border: 1px solid #D1E4DB;
          border-radius: 10px;
          padding: 32px 28px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 16px rgba(19, 56, 44, 0.05);
        }
        .fa-success-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #E8F3EE;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .fa-success-reset-btn {
          margin-top: 10px;
          font-size: 13.5px;
          font-weight: 600;
          color: #13382c;
          background: #FAF8F5;
          border: 1px solid #E2DED8;
          padding: 8px 18px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 150ms ease;
        }
        .fa-success-reset-btn:hover {
          background: #13382c;
          color: #FFFFFF;
          border-color: #13382c;
        }

        /* ── Error Feedback ── */
        .fa-error-box {
          grid-column: 1 / -1;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 6px;
        }
        .fa-error-icon-wrap {
          flex-shrink: 0;
          margin-top: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .fa-error-text {
          font-size: 13.5px;
          color: #991B1B;
          line-height: 1.5;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .fa-contact-page-bg {
            padding: 32px 16px 64px;
          }
          .fa-contact-title {
            font-size: 32px;
            margin-bottom: 24px;
          }
          .fa-contact-info-grid {
            grid-template-columns: 1fr;
            gap: 22px;
          }
          .fa-map-heading {
            align-items: flex-start;
            flex-direction: column;
          }
          .fa-map-frame {
            height: 260px;
          }
          .fa-form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .fa-submit-row {
            justify-content: stretch;
          }
          .fa-submit-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
