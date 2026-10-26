'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { STORE_ADDRESS } from '@/lib/constants';

/* ── Social Icons ── */
function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M12.001 2C6.47813 2 2.00098 6.47715 2.00098 12C2.00098 16.9913 5.65783 21.1283 10.4385 21.8785V14.8906H7.89941V12H10.4385V9.79688C10.4385 7.29063 11.9314 5.90625 14.2156 5.90625C15.3097 5.90625 16.4541 6.10156 16.4541 6.10156V8.5625H15.1931C13.9509 8.5625 13.5635 9.33334 13.5635 10.1242V12H16.3369L15.8936 14.8906H13.5635V21.8785C18.3441 21.1283 22.001 16.9913 22.001 12C22.001 6.47715 17.5238 2 12.001 2Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M12.001 9C10.3436 9 9.00098 10.3431 9.00098 12C9.00098 13.6573 10.3441 15 12.001 15C13.6583 15 15.001 13.6569 15.001 12C15.001 10.3427 13.6579 9 12.001 9ZM12.001 7C14.7614 7 17.001 9.2371 17.001 12C17.001 14.7605 14.7639 17 12.001 17C9.24051 17 7.00098 14.7629 7.00098 12C7.00098 9.23953 9.23808 7 12.001 7ZM18.501 6.74915C18.501 7.43926 17.9402 7.99917 17.251 7.99917C16.5609 7.99917 16.001 7.4384 16.001 6.74915C16.001 6.0599 16.5617 5.5 17.251 5.5C17.9393 5.49913 18.501 6.0599 18.501 6.74915ZM12.001 4C9.5265 4 9.12318 4.00655 7.97227 4.0578C7.18815 4.09461 6.66253 4.20007 6.17416 4.38967C5.74016 4.55799 5.42709 4.75898 5.09352 5.09255C4.75867 5.4274 4.55804 5.73963 4.3904 6.17383C4.20036 6.66332 4.09493 7.18811 4.05878 7.97115C4.00703 9.0752 4.00098 9.46105 4.00098 12C4.00098 14.4745 4.00753 14.8778 4.05877 16.0286C4.0956 16.8124 4.2012 17.3388 4.39034 17.826C4.5591 18.2606 4.7605 18.5744 5.09246 18.9064C5.42863 19.2421 5.74179 19.4434 6.17187 19.6094C6.66619 19.8005 7.19148 19.9061 7.97212 19.9422C9.07618 19.9939 9.46203 20 12.001 20C14.4755 20 14.8788 19.9934 16.0296 19.9422C16.8117 19.9055 17.3385 19.7996 17.827 19.6106C18.2604 19.4423 18.5752 19.2402 18.9074 18.9085C19.2436 18.5718 19.4445 18.2594 19.6107 17.8283C19.8013 17.3358 19.9071 16.8098 19.9432 16.0289C19.9949 14.9248 20.001 14.5389 20.001 12C20.001 9.52552 19.9944 9.12221 19.9432 7.97137C19.9064 7.18906 19.8005 6.66149 19.6113 6.17318C19.4434 5.74038 19.2417 5.42635 18.9084 5.09255C18.573 4.75715 18.2616 4.55693 17.8271 4.38942C17.338 4.19954 16.8124 4.09396 16.0298 4.05781C14.9258 4.00605 14.5399 4 12.001 4ZM12.001 2C14.7176 2 15.0568 2.01 16.1235 2.06C17.1876 2.10917 17.9135 2.2775 18.551 2.525C19.2101 2.77917 19.7668 3.1225 20.3226 3.67833C20.8776 4.23417 21.221 4.7925 21.476 5.45C21.7226 6.08667 21.891 6.81333 21.941 7.8775C21.9885 8.94417 22.001 9.28333 22.001 12C22.001 14.7167 21.991 15.0558 21.941 16.1225C21.8918 17.1867 21.7226 17.9125 21.476 18.55C21.2218 19.2092 20.8776 19.7658 20.3226 20.3217C19.7668 20.8767 19.2076 21.22 18.551 21.475C17.9135 21.7217 17.1876 21.89 16.1235 21.94C15.0568 21.9875 14.7176 22 12.001 22C9.28431 22 8.94514 21.99 7.87848 21.94C6.81431 21.8908 6.08931 21.7217 5.45098 21.475C4.79264 21.2208 4.23514 20.8767 3.67931 20.3217C3.12348 19.7658 2.78098 19.2067 2.52598 18.55C2.27848 17.9125 2.11098 17.1867 2.06098 16.1225C2.01348 15.0558 2.00098 14.7167 2.00098 12C2.00098 9.28333 2.01098 8.94417 2.06098 7.8775C2.11014 6.8125 2.27848 6.0875 2.52598 5.45C2.78014 4.79167 3.12348 4.23417 3.67931 3.67833C4.23514 3.1225 4.79348 2.78 5.45098 2.525C6.08848 2.2775 6.81348 2.11 7.87848 2.06C8.94514 2.0125 9.28431 2 12.001 2Z" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18}>
      <path d="M16 8.24537V15.5C16 19.0899 13.0899 22 9.5 22C5.91015 22 3 19.0899 3 15.5C3 11.9101 5.91015 9 9.5 9C10.0163 9 10.5185 9.06019 11 9.17393V12.3368C10.5454 12.1208 10.0368 12 9.5 12C7.567 12 6 13.567 6 15.5C6 17.433 7.567 19 9.5 19C11.433 19 13 17.433 13 15.5V2H16C16 4.76142 18.2386 7 21 7V10C19.1081 10 17.3696 9.34328 16 8.24537Z" />
    </svg>
  );
}

function IconDropdownMobile({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        flexShrink: 0,
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 250ms ease',
      }}
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Footer column: plain heading at ≥900px, accordion toggle on mobile ── */
interface FooterColumnProps {
  id: string;
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

function FooterColumn({ id, title, expanded, onToggle, children, className }: FooterColumnProps) {
  return (
    <div className={`ft-col ${className || ''}`}>
      <button
        type="button"
        className="ft-col-head"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`ft-col-body-${id}`}
      >
        <span>{title}</span>
        <span className="ft-col-toggle">
          <IconDropdownMobile open={expanded} />
        </span>
      </button>
      <div
        id={`ft-col-body-${id}`}
        className={`ft-col-body ${expanded ? 'is-open' : ''}`}
      >
        <div className="ft-col-body-inner">{children}</div>
      </div>
    </div>
  );
}

export function Footer() {
  const pathname = usePathname();
  const [openCols, setOpenCols] = useState<Record<string, boolean>>({});

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const toggleCol = (id: string) =>
    setOpenCols((p) => ({ ...p, [id]: !p[id] }));

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Products', href: '/shop' },
    { label: 'Contact Us', href: '/pages/contact' },
  ];

  const companyLinks = [
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'My account', href: '/profile' },
    { label: 'Cart', href: '/cart' },
    { label: 'About us', href: '/pages/about' },
  ];
  const mapQuery = encodeURIComponent(`${STORE_ADDRESS}, Sri Lanka`);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  return (
    <footer className="w-full bg-[#f9fafb] border-t border-[#f0f0f0] mt-auto">
      {/* ═══ TOP: Brand, links, and map columns ═══ */}
      <div className="container-main footer-container py-[32px] lg:py-[40px]">
        <div className="footer-grid">
          {/* Column 1: RKF Brand */}
          <div className="ft-col ft-col-about">
            <Link
              href="/"
              className="inline-flex items-center mb-[14px] hover:opacity-90 transition-opacity"
              aria-label="RKF Home"
            >
              <Image
                src="/logo.jpg"
                alt="RKF Distributors"
                width={120}
                height={114}
                className="h-[48px] w-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
                priority
              />
            </Link>
            <p className="text-[14px] text-[#555555] leading-[1.65] mb-[16px] max-w-[320px]">
              RKF Distributors (Pvt) Ltd is your trusted destination for quality retail products, everyday essentials, and fast, reliable delivery.
            </p>
            <div className="flex items-center gap-[16px]">
              <a
                href="https://web.facebook.com/profile.php?id=61587176139721"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#222222] hover:text-[#111827] hover:-translate-y-0.5 transition-all duration-150 flex items-center justify-center"
              >
                <IconFacebook />
              </a>
              <a
                href="https://www.instagram.com/rkfdistributorspvtltd/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#222222] hover:text-[#111827] hover:-translate-y-0.5 transition-all duration-150 flex items-center justify-center"
              >
                <IconInstagram />
              </a>
              <a
                href="https://www.tiktok.com/@rkf.distributors.p"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-[#222222] hover:text-[#111827] hover:-translate-y-0.5 transition-all duration-150 flex items-center justify-center"
              >
                <IconTikTok />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <FooterColumn
            id="quick"
            title="Quick Links"
            expanded={!!openCols.quick}
            onToggle={() => toggleCol('quick')}
          >
            <div className="flex flex-col gap-[9px]">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[14px] text-[#555555] hover:text-[#111827] transition-all duration-150 no-underline whitespace-nowrap hover:translate-x-0.5 inline-block"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </FooterColumn>

          {/* Column 3: Company */}
          <FooterColumn
            id="company"
            title="Company"
            expanded={!!openCols.company}
            onToggle={() => toggleCol('company')}
          >
            <div className="flex flex-col gap-[9px]">
              {companyLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[14px] text-[#555555] hover:text-[#111827] transition-all duration-150 no-underline whitespace-nowrap hover:translate-x-0.5 inline-block"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </FooterColumn>

          <div className="ft-col ft-col-map">
            <h2 className="ft-map-title">Find Us</h2>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open map and directions to ${STORE_ADDRESS}`}
              className="ft-map-link"
            >
              <iframe
                title="Map to RKF Distributors in Kopay South, Jaffna"
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                tabIndex={-1}
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM: Copyright Bar ═══ */}
      <div className="w-full bg-[#f9fafb] border-t border-[#f0f0f0] py-[14px]">
        <div className="container-main footer-container">
          <p className="text-[13px] text-[#6b7280] text-center m-0 leading-normal tracking-wide">
            &copy; 2026 <strong className="font-semibold text-[#111827]">RKF DISTRIBUTORS</strong> All rights reserved. | Developed by{' '}
            <strong className="font-semibold text-[#111827]">NeonLabz (Pvt) Ltd.</strong>
          </p>
        </div>
      </div>

      <style>{`
        .container-main.footer-container {
          padding-inline: calc(1.5rem + 18px);
        }
        @media (min-width: 750px) {
          .container-main.footer-container {
            padding-inline: calc(2rem + 18px);
          }
        }
        @media (min-width: 992px) {
          .container-main.footer-container {
            padding-inline: calc(3rem + 18px);
          }
        }
        @media (min-width: 1200px) {
          .container-main.footer-container {
            padding-inline: calc(4rem + 18px);
          }
        }

        /* ── Desktop (≥900px) — flex with space-between so columns sit gracefully across the bounded container ── */
        @media (min-width: 900px) {
          .footer-grid {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            width: 100%;
            gap: 32px;
          }
          .ft-col {
            flex: 0 0 auto;
          }
          .ft-col-about {
            max-width: 320px;
          }
          .ft-col-map {
            width: 220px;
          }
          .ft-map-title {
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 700;
            color: #111827;
          }
          .ft-map-link {
            display: block;
            overflow: hidden;
            height: 130px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .ft-map-link iframe {
            display: block;
            width: 100%;
            height: 100%;
            border: 0;
            pointer-events: none;
          }
          .ft-col-head {
            all: unset;
            display: block;
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 14px;
            cursor: default;
            letter-spacing: -0.01em;
          }
          .ft-col-toggle { display: none; }
          .ft-col-body {
            display: block;
            overflow: visible;
          }
          .ft-col-body-inner { padding: 0; }
        }

        /* ── Tablet (640px to 899px) — 2x2 grid with balanced spacing ── */
        @media (min-width: 640px) and (max-width: 899px) {
          .footer-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 28px 40px;
          }
          .ft-col {
            width: 100%;
          }
          .ft-col-about {
            max-width: 100%;
          }
          .ft-col-map {
            width: 100%;
          }
          .ft-map-title {
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 700;
            color: #111827;
          }
          .ft-map-link {
            display: block;
            overflow: hidden;
            height: 160px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .ft-map-link iframe {
            display: block;
            width: 100%;
            height: 100%;
            border: 0;
            pointer-events: none;
          }
          .ft-col-head {
            all: unset;
            display: block;
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 12px;
            cursor: default;
          }
          .ft-col-toggle { display: none; }
          .ft-col-body {
            display: block;
            overflow: visible;
          }
          .ft-col-body-inner { padding: 0; }
        }

        /* ── Mobile (<640px) — accordion navigation ── */
        @media (max-width: 639px) {
          .footer-grid {
            display: flex;
            flex-direction: column;
            gap: 0;
          }
          .ft-col {
            width: 100%;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 0;
          }
          .ft-col-about {
            max-width: 100%;
            padding-bottom: 20px;
            margin-bottom: 6px;
          }
          .ft-col-map {
            padding: 16px 0;
          }
          .ft-map-title {
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 700;
            color: #111827;
          }
          .ft-map-link {
            display: block;
            overflow: hidden;
            height: 180px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .ft-map-link iframe {
            display: block;
            width: 100%;
            height: 100%;
            border: 0;
            pointer-events: none;
          }
          .ft-col:last-child {
            border-bottom: none;
            padding-bottom: 0;
          }
          .ft-col-head {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 0;
            padding: 2px 0;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            background: transparent;
            border: 0;
          }
          .ft-col-toggle {
            display: inline-flex;
            color: #6b7280;
          }
          .ft-col-body {
            display: grid;
            grid-template-rows: 0fr;
            opacity: 0;
            transition:
              grid-template-rows 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 250ms ease;
          }
          .ft-col-body.is-open {
            grid-template-rows: 1fr;
            opacity: 1;
          }
          .ft-col-body-inner {
            overflow: hidden;
            min-height: 0;
            padding: 8px 0 14px;
          }
        }
      `}</style>
    </footer>
  );
}
