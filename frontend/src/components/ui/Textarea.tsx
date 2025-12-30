'use client';

import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      fullWidth = true,
      className = '',
      disabled,
      readOnly,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = props.id || props.name || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className={`block text-sm font-medium mb-1.5 ${
              error ? 'text-red-600' : 'text-stone-700'
            }`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
            w-full px-3 py-2.5 text-sm
            border rounded-lg
            transition-all duration-200
            placeholder:text-stone-400
            resize-none
            ${
              error
                ? 'border-red-400 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                : 'border-stone-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500 hover:border-stone-300'
            }
            ${
              disabled || readOnly
                ? 'bg-stone-100 text-stone-500 cursor-not-allowed'
                : 'bg-white'
            }
            ${className}
          `}
          disabled={disabled}
          readOnly={readOnly}
          {...props}
        />
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

Textarea.displayName = 'Textarea';

export default Textarea;
