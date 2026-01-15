'use client';

import React from 'react';

type BadgeVariant = 'gray' | 'green' | 'red' | 'yellow' | 'blue' | 'teal' | 'orange';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

// 미니멀한 Badge 디자인 - 상태 표시용 컬러 뱃지
const variantClasses: Record<BadgeVariant, string> = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  yellow: 'bg-amber-50 text-amber-700',
  blue: 'bg-blue-50 text-blue-700',
  teal: 'bg-teal-50 text-teal-700',
  orange: 'bg-orange-50 text-orange-700',
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  children,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-medium rounded-full
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// 상태별 뱃지 컴포넌트
interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const getStatusVariant = (status: string): BadgeVariant => {
  const statusMap: Record<string, BadgeVariant> = {
    // 진행 상태
    'DRAFT': 'gray',
    'PENDING': 'yellow',
    'APPROVED': 'green',
    'REJECTED': 'red',
    'COMPLETED': 'blue',
    'CANCELLED': 'gray',
    // 사용여부
    'Y': 'green',
    'N': 'gray',
    // 기타
    'ACTIVE': 'green',
    'INACTIVE': 'gray',
  };
  return statusMap[status] || 'gray';
};

export const getStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'DRAFT': '임시저장',
    'PENDING': '대기',
    'APPROVED': '승인',
    'REJECTED': '반려',
    'COMPLETED': '완료',
    'CANCELLED': '취소',
    'Y': '사용',
    'N': '미사용',
    'ACTIVE': '활성',
    'INACTIVE': '비활성',
  };
  return labelMap[status] || status;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  return (
    <Badge variant={getStatusVariant(status)} className={className}>
      {getStatusLabel(status)}
    </Badge>
  );
};

export default Badge;
