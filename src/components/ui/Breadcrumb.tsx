import Link from 'next/link';
import { cn } from '@/utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-[1.3rem] text-body', className)}>
      <ol className="flex items-center flex-nowrap whitespace-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-[0.4rem]">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-[0.4rem]">
            {index > 0 && <span className="text-border">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-heading transition-colors underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-heading">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
