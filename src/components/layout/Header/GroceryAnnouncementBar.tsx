'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import {
  IconTwitterX,
  IconFacebook,
  IconInstagram,
  IconTikTok,
  IconLinkedIn,
  IconArrowLeftS,
  IconArrowRightS,
  IconArrowDownS,
  IconSriLankaFlag,
} from '@/lib/icons';
import { useSlider } from '@/lib/useSlider';

/* ──────────────────────────────────
   Data
   ────────────────────────────────── */

const socialLinks = [
  { name: 'Twitter', Icon: IconTwitterX, href: '#' },
  { name: 'Facebook', Icon: IconFacebook, href: '#' },
  { name: 'Instagram', Icon: IconInstagram, href: '#' },
  { name: 'TikTok', Icon: IconTikTok, href: '#' },
  { name: 'LinkedIn', Icon: IconLinkedIn, href: '#' },
];

const defaultAnnouncements = [
  'Welcome to our store →',
  'Free shipping on orders over $150 →',
  'New arrivals just dropped →',
];

const currencies = [
  'Sri Lanka LKR',
];

const languages = [
  'English',
];

/* ──────────────────────────────────
   Dropdown
   ────────────────────────────────── */

interface DropdownProps {
  selected: string;
  options: string[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  textColor?: string;
}

function Dropdown({ selected, options, onSelect, isOpen, onToggle, onClose, textColor = '#fff' }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: isOpen ? 999 : 'auto' }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          color: textColor,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {selected.includes('Sri Lanka') && <IconSriLankaFlag />}
        {selected}
        <span
          style={{
            display: 'inline-flex',
            transition: 'transform 300ms ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <IconArrowDownS size={18} />
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '220px',
            backgroundColor: '#fff',
            border: '1px solid #e5e5e5',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            paddingTop: '12px',
            paddingBottom: '12px',
            zIndex: 999,
            animation: 'slideUp 200ms ease-out',
          }}
        >
          {options.map((option) => (
            <button
              key={option}
              role="menuitem"
              onClick={() => { onSelect(option); onClose(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                textAlign: 'left',
                padding: '10px 24px',
                fontSize: '14px',
                color: '#222',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F15B41'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#222'; }}
            >
              {option.includes('Sri Lanka') && <IconSriLankaFlag />}
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────
   GroceryAnnouncementBar
   ────────────────────────────────── */

export function GroceryAnnouncementBar({ backgroundColor = 'rgb(27, 128, 87)', textColor = '#fff', announcements }: { backgroundColor?: string; textColor?: string; announcements?: string[] } = {}) {
  const slides = announcements ?? defaultAnnouncements;
  const { current, direction, goNext, goPrev } = useSlider(slides.length);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('Sri Lanka LKR');
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const toggleCurrency = useCallback(() => {
    setCurrencyOpen((p) => !p);
    setLanguageOpen(false);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageOpen((p) => !p);
    setCurrencyOpen(false);
  }, []);

  const closeCurrency = useCallback(() => setCurrencyOpen(false), []);
  const closeLanguage = useCallback(() => setLanguageOpen(false), []);

  return (
    <div style={{ backgroundColor, color: textColor, height: '40px', position: 'relative', overflow: 'visible' }}>
      <div
        className="container-main announce-grid"
        style={{
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          alignItems: 'center',
        }}
      >
        {/* ── Column 1: Social Icons ── */}
        <div className="announce-social" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {socialLinks.map(({ name, Icon, href }) => (
            <a
              key={name}
              href={href}
              aria-label={name}
              style={{ color: 'inherit', display: 'flex' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F15B41'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'inherit'; }}
            >
              <Icon size={16} />
            </a>
          ))}
        </div>

        {/* ── Column 2: Announcement Slider — extends full 2fr width ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <button
            onClick={goPrev}
            aria-label="Previous announcement"
            style={{ background: 'none', border: 'none', color: textColor, cursor: 'pointer', display: 'flex', padding: 0, flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F15B41'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = textColor; }}
          >
            <IconArrowLeftS size={20} />
          </button>

          <div style={{ position: 'relative', overflow: 'hidden', height: '20px', flex: '1 1 0%', margin: '0 12px' }}>
            {slides.map((text, i) => {
              const isActive = i === current;
              const offset = direction === 'next' ? '100%' : '-100%';
              return (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    transition: 'transform 600ms ease, opacity 600ms ease',
                    transform: isActive ? 'translateX(0)' : `translateX(${offset})`,
                    opacity: isActive ? 1 : 0,
                  }}
                >
                  {text}
                </span>
              );
            })}
          </div>

          <button
            onClick={goNext}
            aria-label="Next announcement"
            style={{ background: 'none', border: 'none', color: textColor, cursor: 'pointer', display: 'flex', padding: 0, flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F15B41'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = textColor; }}
          >
            <IconArrowRightS size={20} />
          </button>
        </div>

        <div
          className="announce-dropdowns"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            justifyContent: 'flex-end',
            fontSize: '13.5px',
            color: textColor,
          }}
        >
          {/* Sri Lanka + Differentiated LKR */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
            <IconSriLankaFlag />
            <span style={{ fontWeight: 500 }}>Sri Lanka</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '2px 6px',
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                borderRadius: '3px',
                lineHeight: 1.2,
                color: textColor,
              }}
            >
              LKR
            </span>
          </div>

          {/* Separator */}


          {/* Language: English */}

        </div>
      </div>

      <style jsx>{`
        @media (max-width: 991px) {
          :global(.announce-grid) {
            grid-template-columns: 1fr !important;
          }
          :global(.announce-social),
          :global(.announce-dropdowns) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
