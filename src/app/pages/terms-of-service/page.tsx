'use client';

import Link from 'next/link';
import { TermsAndConditionsContent } from '@/components/shared/TermsAndConditionsContent';
import { TERMS_LAST_UPDATED } from '@/data/termsAndConditions';

export default function TermsOfServicePage() {
  return (
    <>
      <div className="fa-tos-page-header">
        <div className="container-main">
          <div className="flex items-center justify-center gap-[8px] text-[14px] mb-[12px]">
            <Link href="/" className="text-[#777] underline underline-offset-[3px] hover:text-[#111]">
              Home
            </Link>
            <span className="text-[#bbb]">/</span>
            <span className="text-[#222] font-medium">Terms and Conditions</span>
          </div>
          <h1 className="fa-tos-h1">Terms and Conditions</h1>
          <p className="text-[14px] text-[#666] mt-[8px]">Last Updated: {TERMS_LAST_UPDATED}</p>
        </div>
      </div>

      <div className="container-main fa-tos-content-wrap">
        <div className="fa-tos-prose">
          <TermsAndConditionsContent variant="page" />
        </div>
      </div>

      <style>{`
        .fa-tos-page-header {
          background-color: rgb(247, 248, 252);
          padding: 40px 0 50px;
          text-align: center;
        }
        .fa-tos-h1 {
          font-size: 40px;
          font-weight: 600;
          color: #222;
          margin: 0;
        }
        .fa-tos-content-wrap {
          padding-block: 50px 90px;
        }
        .fa-tos-prose {
          max-width: 760px;
          margin: 0 auto;
        }
        @media (max-width: 749px) {
          .fa-tos-page-header {
            padding: clamp(28px, 6vw, 40px) 0 clamp(30px, 7vw, 50px);
          }
          .fa-tos-h1 {
            font-size: clamp(26px, 6.5vw, 40px);
          }
          .fa-tos-content-wrap {
            padding-block: clamp(32px, 6vw, 50px) clamp(50px, 10vw, 90px);
          }
        }
      `}</style>
    </>
  );
}
