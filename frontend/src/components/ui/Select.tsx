'use client';

import React, { forwardRef, useId } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      options,
      placeholder,
      fullWidth = true,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = props.id || props.name || generatedId;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={selectId}
            className={`block text-sm font-medium mb-1.5 ${
              error ? 'text-red-600' : 'text-stone-700'
            }`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-3 py-2.5 text-sm
              border rounded-lg
              appearance-none
              transition-all duration-200
              bg-white
              ${
                error
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                  : 'border-stone-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 hover:border-stone-300'
              }
              ${disabled ? 'bg-stone-100 text-stone-500 cursor-not-allowed' : ''}
              ${className}
            `}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-stone-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {(error || helperText) && (
          <p
            className={`mt-1.5 text-xs ${
              error ? 'text-red-500' : 'text-stone-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
