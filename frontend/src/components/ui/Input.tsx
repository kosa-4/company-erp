'use client';

import React, { forwardRef , useId} from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      disabled,
      readOnly,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = props.id || props.name || generatedId;

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
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-3 py-2.5 text-sm
              border rounded-lg
              transition-all duration-200
              placeholder:text-stone-400
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-400 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                  : 'border-stone-200 focus:ring-2 focus:ring-teal-100 focus:border-teal-500'
              }
              ${
                disabled || readOnly
                  ? 'bg-stone-100 text-stone-500 cursor-not-allowed'
                  : 'bg-white hover:border-stone-300'
              }
              ${className}
            `}
            disabled={disabled}
            readOnly={readOnly}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';

export default Input;
