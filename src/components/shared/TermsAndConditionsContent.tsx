'use client';

import React from 'react';
import {
  TERMS_WELCOME,
  TERMS_SECTIONS,
  TERMS_CONTACT_INFO,
  TERMS_THANK_YOU,
} from '@/data/termsAndConditions';

interface TermsAndConditionsContentProps {
  variant?: 'page' | 'modal';
  className?: string;
}

export function TermsAndConditionsContent({
  variant = 'page',
  className = '',
}: TermsAndConditionsContentProps) {
  const isModal = variant === 'modal';

  return (
    <div className={`terms-content-root ${isModal ? 'terms-content-modal' : 'terms-content-page'} ${className}`}>
      {/* Welcome / Intro */}
      <p
        className={`leading-[1.7] text-[#333] ${
          isModal ? 'text-[13.5px] mb-[16px]' : 'text-[15.5px] sm:text-[16px] mb-[24px]'
        }`}
      >
        {TERMS_WELCOME.split('RKF Distributors').reduce<React.ReactNode[]>((acc, part, i) => {
          if (i === 0) return [part];
          return [...acc, <strong key={i}>RKF Distributors</strong>, part];
        }, [])}
      </p>

      {/* Numbered Sections */}
      <div className={isModal ? 'space-y-[16px]' : 'space-y-[28px]'}>
        {TERMS_SECTIONS.map((sec) => (
          <div key={sec.id} className="terms-section-block">
            {/* Section Header */}
            <h3
              className={`font-bold text-[#111827] tracking-tight ${
                isModal
                  ? 'text-[14.5px] sm:text-[15px] mb-[8px]'
                  : 'text-[18px] sm:text-[20px] mb-[12px] pt-[4px]'
              }`}
            >
              {sec.number}. {sec.title}
            </h3>

            {/* Optional Intro */}
            {sec.intro && (
              <p
                className={`text-[#475569] leading-[1.65] mb-[8px] ${
                  isModal ? 'text-[13px]' : 'text-[15px]'
                }`}
              >
                {sec.intro}
              </p>
            )}

            {/* Optional Callout / Alert */}
            {sec.callout && (
              <div
                className={`bg-[#fef2f2] border-l-4 border-[#dc2626] rounded-r-[6px] mb-[12px] ${
                  isModal ? 'p-[10px_14px]' : 'p-[12px_16px]'
                }`}
              >
                <p className={`m-0 font-bold text-[#991b1b] ${isModal ? 'text-[13px]' : 'text-[15px]'}`}>
                  {sec.callout}
                </p>
              </div>
            )}

            {/* Bullet Points */}
            {sec.items && sec.items.length > 0 && (
              <ul
                className={`list-disc text-[#334155] leading-[1.7] ${
                  isModal
                    ? 'pl-[18px] space-y-[6px] text-[13px]'
                    : 'pl-[22px] space-y-[8px] text-[15px]'
                }`}
              >
                {sec.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}

            {/* Optional Footer Note */}
            {sec.footerNote && (
              <p
                className={`text-[#64748b] italic leading-[1.6] mt-[10px] ${
                  isModal ? 'text-[12px]' : 'text-[14px]'
                }`}
              >
                {sec.footerNote}
              </p>
            )}

            {/* Section 8: Contact Card */}
            {sec.id === 'contact-information' && (
              <div
                className={`bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] mt-[12px] ${
                  isModal ? 'p-[12px_16px]' : 'p-[16px_20px]'
                }`}
              >
                <p
                  className={`m-0 leading-[1.8] text-[#1e293b] ${
                    isModal ? 'text-[13px]' : 'text-[15px]'
                  }`}
                >
                  <strong>Business Name:</strong> {TERMS_CONTACT_INFO.businessName}
                  <br />
                  <strong>Address:</strong> {TERMS_CONTACT_INFO.address}
                  <br />
                  <strong>Working Hours:</strong> {TERMS_CONTACT_INFO.workingHours}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Thank you note */}
      <p
        className={`font-semibold text-[#111827] ${
          isModal ? 'text-[13px] mt-[18px]' : 'text-[16px] mt-[32px]'
        }`}
      >
        {TERMS_THANK_YOU}
      </p>
    </div>
  );
}
