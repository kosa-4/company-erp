'use client';

import React, { useState } from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';
import Button from './Button';

interface SearchPanelProps {
  children: React.ReactNode;
  onSearch: () => void;
  onReset?: () => void;
  loading?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  showSearchButton?: boolean;
}

// 미니멀한 SearchPanel 디자인
const SearchPanel: React.FC<SearchPanelProps> = ({
  children,
  onSearch,
  onReset,
  loading = false,
  collapsible = true,
  defaultExpanded = true,
  showSearchButton = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-5">
      {collapsible && (
        <div
          className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2.5">
            {/* 무채색 아이콘 */}
            <div className="w-7 h-7 rounded-lg bg-gray-200 flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <span className="font-medium text-gray-700 text-sm">검색조건</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      )}

      {isExpanded && (
        <div className="p-5" onKeyDown={handleKeyDown}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {children}
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-gray-100">
            {onReset && (
              <Button variant="secondary" onClick={onReset} icon={<RotateCcw className="w-4 h-4" />}>
                초기화
              </Button>
            )}
            {showSearchButton && (
              <Button variant="primary" onClick={onSearch} loading={loading} icon={<Search className="w-4 h-4" />}>
                조회
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
