'use client';

import React, { forwardRef } from 'react';

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, required = false, fullWidth = true, className = '', ...props }, ref) => {
    const inputId = props.id || props.name || `date-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-1.5 ${
              error ? 'text-red-600' : 'text-stone-700'
            }`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type="date"
          className={`
            w-full px-3 py-2.5 text-sm
            border rounded-lg
            transition-all duration-200
            ${
              error
                ? 'border-red-400 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                : 'border-stone-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 hover:border-stone-300'
            }
            ${props.disabled ? 'bg-stone-100 text-stone-500 cursor-not-allowed' : 'bg-white'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
