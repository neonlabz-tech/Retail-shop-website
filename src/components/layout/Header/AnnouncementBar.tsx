'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
    <div ref={ref} className={`relative ${isOpen ? 'z-[999]' : 'z-auto'}`}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-[6px] text-[14px] cursor-pointer bg-transparent border-none whitespace-nowrap"
        style={{ color: textColor }}
      >
        {selected.includes('Sri Lanka') && <IconSriLankaFlag />}
        {selected}
        <span
          className={`inline-flex transition-transform duration-300 ease-in-out ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <IconArrowDownS size={18} />
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute top-[calc(100%+8px)] right-0 min-w-[220px] bg-white border border-[#e5e5e5] shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-[12px] z-[999] animate-[slideUp_200ms_ease-out]"
        >
          {options.map((option) => (
            <button
              key={option}
              role="menuitem"
              onClick={() => { onSelect(option); onClose(); }}
              className="flex items-center gap-[8px] w-full text-left py-[10px] px-[24px] text-[14px] text-[#222] bg-transparent border-none cursor-pointer"
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

interface AnnouncementBarProps {
  backgroundColor?: string;
  announcements?: string[];
  height?: string;
  textColor?: string;
  autoplay?: boolean;
}

export function AnnouncementBar({ backgroundColor = '#fff', announcements: announcementsProp, height = '36px', textColor = '#222', autoplay = false }: AnnouncementBarProps = {}) {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const announcements = announcementsProp ?? defaultAnnouncements;
  const { current, direction, goNext, goPrev } = useSlider(announcements.length, autoplay);
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

  const isLightText = textColor === '#fff' || textColor === '#ffffff' || textColor === 'white';

  return (
    <div
      className={`relative overflow-visible border-b border-[#edf0f4] h-[36px] ${
        backgroundColor === '#000' || backgroundColor === '#000000' ? 'bg-black' : 'bg-white'
      } ${isLightText ? 'text-white' : 'text-[#222]'}`}
    >
      <div className="container-main h-full flex justify-end items-center">
        <div
          className={`announce-dropdowns flex items-center gap-[16px] justify-end text-[13px] ${
            isLightText ? 'text-white' : 'text-[#222]'
          }`}
        >
          <div className="inline-flex items-center gap-[7px] whitespace-nowrap">
            <IconSriLankaFlag />
            <span className="font-medium">Sri Lanka</span>
            <span className="text-[11px] font-bold tracking-[0.04em] px-[7px] py-[2px] bg-[#111] rounded-[3px] leading-[1.2] text-white">
              LKR
            </span>
          </div>




        </div>
      </div>
    </div>
  );
}
