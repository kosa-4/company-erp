'use client';

import React from 'react';
import { StatusType } from '@/types';

type BadgeVariant = 'gray' | 'yellow' | 'green' | 'red' | 'blue' | 'teal' | 'orange';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  gray: 'bg-stone-100 text-stone-700',
  yellow: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700',
  teal: 'bg-teal-50 text-teal-700',
  orange: 'bg-orange-50 text-orange-700',
};

const dotColors: Record<BadgeVariant, string> = {
  gray: 'bg-stone-400',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  teal: 'bg-teal-500',
  orange: 'bg-orange-500',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

// 상태에 따른 Badge variant 매핑
export const getStatusVariant = (status: StatusType): BadgeVariant => {
  switch (status) {
    case 'TEMP':
      return 'gray';
    case 'PENDING':
      return 'yellow';
    case 'APPROVED':
    case 'COMPLETE':
      return 'green';
    case 'REJECTED':
    case 'CANCELED':
      return 'red';
    case 'IN_PROGRESS':
      return 'teal';
    default:
      return 'gray';
  }
};

// 상태 한글명 매핑
export const getStatusLabel = (status: StatusType): string => {
  switch (status) {
    case 'TEMP':
      return '임시저장';
    case 'PENDING':
      return '승인대기';
    case 'APPROVED':
      return '승인';
    case 'REJECTED':
      return '반려';
    case 'COMPLETE':
      return '완료';
    case 'CANCELED':
      return '취소';
    case 'IN_PROGRESS':
      return '진행중';
    default:
      return status;
  }
};

const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  size = 'md',
  children,
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

// 상태 Badge 컴포넌트
export const StatusBadge: React.FC<{ status: StatusType; size?: BadgeSize }> = ({ 
  status, 
  size = 'md' 
}) => {
  return (
    <Badge variant={getStatusVariant(status)} size={size} dot>
      {getStatusLabel(status)}
    </Badge>
  );
};

export default Badge;
