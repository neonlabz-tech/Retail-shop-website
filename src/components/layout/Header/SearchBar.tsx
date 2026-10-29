'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';

function IconSearch({ size = 22 }: { size?: number }) {
  return (
    <svg
      className="icon icon-search"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      focusable="false"
      width={size}
      height={size}
    >
      <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
    </svg>
  );
}

export function SearchBar() {
  const [value, setValue] = useState('');
  const router = useRouter();
  const { openSearch } = useUIStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/products?q=${encodeURIComponent(value.trim())}`);
    } else {
      openSearch();
    }
  };

  return (
    <form
      className="hdr-search"
      onSubmit={handleSubmit}
      role="search"
    >
      <input
        type="text"
        placeholder="What are you looking for..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onClick={openSearch}
        aria-label="Search"
        className="hdr-search-input"
      />
      <button
        type="submit"
        aria-label="Submit search"
        className="hdr-search-btn"
      >
        <IconSearch size={22} />
      </button>

      <style>{`
        .hdr-search {
          display: flex;
          align-items: center;
          width: 100%;
          height: 52px;
          background-color: #f4f4f4;
          border-radius: 6px;
          overflow: hidden;
          border: 1.5px solid transparent;
          transition: border-color 220ms ease, background-color 220ms ease;
        }
        .hdr-search:hover {
          border-color: #222;
        }
        .hdr-search:focus-within {
          border-color: #222;
          background-color: #fff;
        }
        .hdr-search-input {
          flex: 1;
          height: 100%;
          padding: 0 22px;
          font-size: 14px;
          color: #222;
          background: transparent;
          border: none;
          outline: none;
        }
        .hdr-search-input::placeholder {
          color: #8a8a8a;
        }
        .hdr-search-btn {
          height: 100%;
          width: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 200ms ease;
        }
        .hdr-search-btn:hover {
          color: #1B8057;
        }
      `}</style>
    </form>
  );
}
