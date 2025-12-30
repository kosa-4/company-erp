'use client';

import React, { useState } from 'react';
import Button from './Button';

interface SearchPanelProps {
  children: React.ReactNode;
  onSearch: () => void;
  onReset?: () => void;
  loading?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  children,
  onSearch,
  onReset,
  loading = false,
  collapsible = true,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden mb-5">
      {collapsible && (
        <div
          className="flex items-center justify-between px-5 py-3.5 bg-stone-50 border-b border-stone-200 cursor-pointer hover:bg-stone-100 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-medium text-stone-700">검색조건</span>
          </div>
          <svg
            className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      )}

      <div
        className={`transition-all duration-300 ease-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <div className="p-5" onKeyDown={handleKeyDown}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {children}
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-stone-200">
            {onReset && (
              <Button variant="secondary" onClick={onReset}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                초기화
              </Button>
            )}
            <Button variant="primary" onClick={onSearch} loading={loading}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              조회
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;
