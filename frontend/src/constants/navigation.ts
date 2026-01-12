import { NavItem } from '@/types';

export const navigationItems: NavItem[] = [
  {
    name: 'My Page',
    href: '/mypage',
    icon: '👤',
    children: [
      { name: '내 정보 수정', href: '/mypage/profile', icon: '' },
      { name: '공지사항', href: '/mypage/notice', icon: '' },
    ],
  },
  {
    name: '기준정보',
    href: '/master',
    icon: '📋',
    children: [
      { name: '품목 현황', href: '/master/item', icon: '' },
      { name: '품목 카테고리', href: '/master/category', icon: '' },
      { name: '협력업체 현황', href: '/master/vendor', icon: '' },
      { name: '협력업체 사용자 관리', href: '/master/vendor-user', icon: '' },
    ],
  },
  {
    name: '구매관리',
    href: '/purchase',
    icon: '🛒',
    children: [
      { name: '구매요청', href: '/purchase/request', icon: '' },
      { name: '구매요청 현황', href: '/purchase/request-list', icon: '' },
    ],
  },
  {
    name: '견적관리',
    href: '/rfq',
    icon: '📝',
    children: [
      { name: '견적대기목록', href: '/rfq/pending', icon: '' },
      { name: '견적진행현황', href: '/rfq/progress', icon: '' },
      { name: '협력업체 선정', href: '/rfq/selection', icon: '' },
      { name: '협력업체 선정결과', href: '/rfq/result', icon: '' },
    ],
  },
  {
    name: '발주관리',
    href: '/order',
    icon: '📦',
    children: [
      { name: '발주대기목록', href: '/order/pending', icon: '' },
      { name: '발주진행현황', href: '/order/progress', icon: '' },
    ],
  },
  {
    name: '재고관리',
    href: '/inventory',
    icon: '🏪',
    children: [
      { name: '입고대상조회', href: '/inventory/receiving-target', icon: '' },
      { name: '입고현황', href: '/inventory/receiving-list', icon: '' },
    ],
  },
];

export const getPageTitle = (pathname: string): string => {
  for (const nav of navigationItems) {
    if (nav.children) {
      for (const child of nav.children) {
        if (child.href === pathname) {
          return child.name;
        }
      }
    }
    if (nav.href === pathname) {
      return nav.name;
    }
  }
  return '구매 ERP';
};

export const getBreadcrumbs = (pathname: string): { name: string; href: string }[] => {
  const breadcrumbs = [{ name: 'Home', href: '/' }];
  
  for (const nav of navigationItems) {
    if (nav.children) {
      for (const child of nav.children) {
        if (child.href === pathname) {
          breadcrumbs.push({ name: nav.name, href: nav.href });
          breadcrumbs.push({ name: child.name, href: child.href });
          return breadcrumbs;
        }
      }
    }
    if (nav.href === pathname) {
      breadcrumbs.push({ name: nav.name, href: nav.href });
      return breadcrumbs;
    }
  }
  
  return breadcrumbs;
};

