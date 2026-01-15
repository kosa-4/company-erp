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
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* 아이콘 영역 - 무채색 */}
          {icon && (
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                {icon}
              </div>
            </div>
          )}
          
          {/* 텍스트 영역 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 mb-0.5">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-500">
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
