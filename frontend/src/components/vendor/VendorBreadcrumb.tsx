'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 협력사 경로별 이름 매핑
const vendorPathNames: Record<string, string> = {
  '/vendor': '홈',
  '/vendor/mypage': 'My Page',
  '/vendor/mypage/profile': '프로필',
  '/vendor/mypage/notice': '공지사항',
  '/vendor/master': '기준정보',
  '/vendor/master/info': '협력업체 변경신청',
  '/vendor/master/users': '담당자관리',
  '/vendor/rfq': '견적관리',
  '/vendor/rfq/submit': '견적현황',
  '/vendor/rfq/result': '견적결과',
  '/vendor/order': '발주관리',
  '/vendor/order/list': '발주서 조회',
};

const VendorBreadcrumb: React.FC = () => {
  const pathname = usePathname();
  
  // 경로를 분리하여 브레드크럼 생성
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { name: string; href: string }[] = [];
  
  let currentPath = '';
  for (const segment of pathSegments) {
    currentPath += `/${segment}`;
    const name = vendorPathNames[currentPath] || segment;
    breadcrumbs.push({ name, href: currentPath });
  }

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
              className="flex items-center gap-1.5 text-sm font-medium text-stone-400 hover:text-emerald-600 transition-colors group"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="group-hover:text-emerald-600">{crumb.name}</span>
            </Link>
          ) : index === breadcrumbs.length - 1 ? (
            <span className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              {crumb.name}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-sm font-medium text-stone-400 hover:text-emerald-600 transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default VendorBreadcrumb;
