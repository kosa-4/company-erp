'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: boolean;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  padding = true,
  className = '',
  hover = false,
}) => {
  return (
    <div 
      className={`
        bg-white rounded-xl border border-stone-200 shadow-sm
        ${hover ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            {title && <h3 className="font-semibold text-stone-900">{title}</h3>}
            {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padding ? 'p-6' : ''}>{children}</div>
    </div>
  );
};

export default Card;
