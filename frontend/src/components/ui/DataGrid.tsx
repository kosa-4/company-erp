'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@/types';

interface DataGridProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyField: keyof T;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  compact?: boolean;
  isRowSelectable?: (row: T) => boolean;  // 행별 선택 가능 여부
}

function DataGrid<T extends object>({
  columns,
  data,
  keyField,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyMessage = '데이터가 없습니다.',
  striped = false,
  compact = false,
  isRowSelectable,
}: DataGridProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      // 선택 가능한 행만 필터링
      const selectableRows = isRowSelectable 
        ? data.filter(row => isRowSelectable(row))
        : data;
      onSelectionChange(checked ? [...selectableRows] : []);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    // 승인 상태인 행은 선택 불가
    if (isRowSelectable && !isRowSelectable(row)) {
      return;
    }
    
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedRows, row]);
      } else {
        onSelectionChange(selectedRows.filter((r) => r[keyField] !== row[keyField]));
      }
    }
  };

  const isRowSelected = (row: T) => {
    return selectedRows.some((r) => r[keyField] === row[keyField]);
  };

  // 선택 가능한 행만 필터링하여 계산
  const selectableData = isRowSelectable 
    ? data.filter(row => isRowSelectable(row))
    : data;
  
  const allSelected = selectableData.length > 0 && selectedRows.length === selectableData.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < selectableData.length;

  // 정렬된 데이터
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const getCellValue = (row: T, column: ColumnDef<T>) => {
    const value = row[column.key as keyof T];
    if (column.render) {
      return column.render(value, row);
    }
    return value as React.ReactNode;
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              {selectable && (
                <th className="w-12 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-stone-300 rounded focus:ring-teal-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  className={`
                    px-4 ${compact ? 'py-2.5' : 'py-3.5'}
                    text-xs font-medium text-stone-500 uppercase tracking-wider
                    ${getAlignClass(column.align)}
                    ${column.sortable ? 'cursor-pointer hover:bg-stone-100 select-none transition-colors' : ''}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key.toString())}
                >
                  <div className={`flex items-center gap-1.5 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                    {column.header}
                    {column.sortable && (
                      <span className="text-stone-400">
                        {sortColumn === column.key ? (
                          sortDirection === 'asc' ? (
                            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )
                        ) : (
                          <svg className="w-4 h-4 opacity-0 group-hover:opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-stone-500">데이터를 불러오는 중...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-14 h-14 text-stone-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span className="text-stone-500">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {sortedData.map((row, index) => {
                  const canSelect = !isRowSelectable || isRowSelectable(row);
                  
                  return (
                    <tr
                      key={String(row[keyField])}
                      className={`
                        transition-colors duration-150
                        ${striped && index % 2 === 1 ? 'bg-stone-50/50' : ''}
                        ${isRowSelected(row) ? 'bg-teal-50' : ''}
                        ${onRowClick ? 'cursor-pointer hover:bg-teal-50/70' : 'hover:bg-stone-50'}
                      `}
                      onClick={() => onRowClick && onRowClick(row)}
                    >
                      {selectable && (
                        <td className="w-12 px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isRowSelected(row)}
                            disabled={!canSelect}
                            onChange={(e) => handleSelectRow(row, e.target.checked)}
                            className={`
                              w-4 h-4 text-teal-600 border-stone-300 rounded focus:ring-teal-500
                              ${!canSelect ? 'cursor-not-allowed opacity-50' : ''}
                            `}
                            title={!canSelect ? '승인된 구매요청은 선택할 수 없습니다' : ''}
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key.toString()}
                          className={`
                            px-4 ${compact ? 'py-2.5' : 'py-3.5'}
                            text-sm text-stone-700
                            ${getAlignClass(column.align)}
                          `}
                        >
                          {getCellValue(row, column)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataGrid;
