'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'wave',
}) => {
  const variantClasses = {
    text: 'rounded-md h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse bg-stone-200',
    wave: 'bg-gradient-to-r from-stone-200 via-stone-100 to-stone-200 bg-[length:200%_100%] animate-shimmer',
    none: 'bg-stone-200',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${animationClasses[animation]}
        ${className}
      `}
      style={style}
    />
  );
};

// 테이블 로우 스켈레톤
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => (
  <tr className="border-b border-stone-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton variant="text" className="h-4 w-3/4" />
      </td>
    ))}
  </tr>
);

// 카드 스켈레톤
export const CardSkeleton: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4"
  >
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-5 w-1/3" />
        <Skeleton variant="text" className="h-4 w-1/2" />
      </div>
    </div>
    <Skeleton variant="rounded" className="h-24 w-full" />
    <div className="flex gap-2">
      <Skeleton variant="rounded" className="h-8 w-20" />
      <Skeleton variant="rounded" className="h-8 w-20" />
    </div>
  </motion.div>
);

// 통계 카드 스켈레톤
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-stone-100 p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-4 w-20" />
        <Skeleton variant="text" className="h-8 w-16" />
      </div>
      <Skeleton variant="circular" width={48} height={48} />
    </div>
  </div>
);

export default Skeleton;
