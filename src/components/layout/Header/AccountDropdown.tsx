'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/* ── Person Icon SVG (matches design from image) ── */
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={22} height={22}>
      <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconLogin() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function IconRegister() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

interface AccountDropdownProps {
  className?: string;
  iconColor?: string;
  hoverColor?: string;
}

export function AccountDropdown({
  className = '',
  iconColor = '#222',
  hoverColor = '#F15B41',
}: AccountDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push('/login');
  };

  const displayName =
    user?.firstName ||
    (user?.email ? user.email.split('@')[0] : 'User');

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-flex items-center ${className}`}
    >
      {/* Account Icon Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Account menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer transition-colors duration-150 text-[#222222] hover:text-[#F15B41]"
        style={iconColor !== '#222' ? { color: iconColor } : undefined}
      >
        <IconUser />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-[calc(100%+1.2rem)] right-0 w-[22rem] bg-white rounded-[0.8rem] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-100 z-50 overflow-hidden"
        >
          {isAuthenticated ? (
            /* ── Logged In: Profile + Logout ── */
            <>
              <div className="px-[1.6rem] py-[1.2rem] bg-[#fafafa] border-b border-gray-100">
                <p className="m-0 text-[1.3rem] font-semibold text-gray-900 truncate">
                  {displayName}
                </p>
                <p className="mt-[0.2rem] text-[1.2rem] text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>

              <div className="py-[0.6rem]">
                {/* 1. Profile */}
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-[1.6rem] py-[1rem] text-[1.4rem] text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150 no-underline"
                >
                  <div className="flex items-center gap-[1rem]">
                    <span className="text-gray-500 flex shrink-0">
                      <IconProfile />
                    </span>
                    <span>Profile & Orders</span>
                  </div>
                </Link>

                {/* 2. Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-[1rem] px-[1.6rem] py-[1rem] text-[1.4rem] text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 text-left bg-transparent border-0 cursor-pointer"
                >
                  <span className="text-red-500 flex shrink-0">
                    <IconLogout />
                  </span>
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            /* ── Not Logged In: Login + Register ── */
            <>
              <div className="px-[1.6rem] py-[1.2rem] bg-[#fafafa] border-b border-gray-100">
                <p className="m-0 text-[1.3rem] font-semibold text-gray-900">
                  Welcome
                </p>
                <p className="mt-[0.2rem] text-[1.2rem] text-gray-500">
                  Manage account & orders
                </p>
              </div>

              <div className="py-[0.6rem]">
                {/* 1. Login */}
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-[1rem] px-[1.6rem] py-[1rem] text-[1.4rem] text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150 no-underline"
                >
                  <span className="text-gray-500 flex shrink-0">
                    <IconLogin />
                  </span>
                  <span>Login</span>
                </Link>

                {/* 2. Register */}
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-[1rem] px-[1.6rem] py-[1rem] text-[1.4rem] text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150 no-underline"
                >
                  <span className="text-gray-500 flex shrink-0">
                    <IconRegister />
                  </span>
                  <span>Register</span>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountDropdown;
