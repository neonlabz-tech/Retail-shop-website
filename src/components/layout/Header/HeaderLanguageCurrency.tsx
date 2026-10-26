'use client';

import { IconSriLankaFlagEmoji as IconSriLankaFlag } from '@/lib/icons';

export { IconSriLankaFlag };

export function HeaderLanguageCurrency({ textColor = '#222' }: { textColor?: string }) {
  const colorClass = textColor === '#fff' || textColor === '#ffffff' ? 'text-white' : 'text-[#222]';
  return (
    <div
      className={`header-lang-currency inline-flex items-center gap-[12px] text-[13px] whitespace-nowrap select-none ${colorClass}`}
    >
      <div className="inline-flex items-center gap-[7px]">
        <IconSriLankaFlag />
        <span className="font-medium">Sri Lanka</span>
        <span className="text-[11px] font-bold bg-[#111] text-white px-[6px] py-[2px] rounded-[3px] tracking-[0.5px]">
          LKR
        </span>
      </div>




    </div>
  );
}
