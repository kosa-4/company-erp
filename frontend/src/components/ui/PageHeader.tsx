'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, children }) => {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* 아이콘 영역 */}
          {icon && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20">
                {icon}
              </div>
            </div>
          )}
          
          {/* 텍스트 영역 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-stone-900 mb-1 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-stone-500 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* 액션 버튼 영역 */}
        {children && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
