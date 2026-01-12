'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';
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
    <motion.div 
      className="bg-white/80 backdrop-blur-xl rounded-2xl border border-stone-100 shadow-sm overflow-hidden mb-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {collapsible && (
        <motion.div
          className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-stone-50 to-stone-100/50 border-b border-stone-100 cursor-pointer hover:from-stone-100 hover:to-stone-50 transition-all"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-stone-700">검색조건</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-stone-400" />
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-5" onKeyDown={handleKeyDown}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {children}
              </div>

              <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-stone-100">
                {onReset && (
                  <Button variant="secondary" onClick={onReset} icon={<RotateCcw className="w-4 h-4" />}>
                    초기화
                  </Button>
                )}
                <Button variant="primary" onClick={onSearch} loading={loading} icon={<Search className="w-4 h-4" />}>
                  조회
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchPanel;
