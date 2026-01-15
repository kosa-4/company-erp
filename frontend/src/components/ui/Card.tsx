'use client';

import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  actions?: React.ReactNode;
}

// 미니멀한 카드 디자인: 흰색 배경, 은은한 그림자, 8-12px radius
const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  padding = true,
  actions,
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 
        shadow-sm hover:shadow-md transition-shadow duration-200
        ${className}
      `}
    >
      {(title || actions) && (
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padding ? 'p-5' : ''}>{children}</div>
    </div>
  );
};

export default Card;
