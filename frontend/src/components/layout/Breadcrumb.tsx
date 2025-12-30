'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getBreadcrumbs } from '@/constants/navigation';

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-2 mb-5 px-1">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          {index > 0 && (
            <svg
              className="w-4 h-4 text-stone-300 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {index === 0 ? (
            <Link
              href={crumb.href}
              className="flex items-center gap-1.5 text-sm font-medium text-stone-400 hover:text-teal-600 transition-colors group"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="group-hover:text-teal-600">{crumb.name}</span>
            </Link>
          ) : index === breadcrumbs.length - 1 ? (
            <span className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
              {crumb.name}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-sm font-medium text-stone-400 hover:text-teal-600 transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
