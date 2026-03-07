import React, { useState } from 'react';

/**
 * Glass-styled input component
 * Implements Requirements 1.1, 29.5, 29.6
 */
const GlassInput = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  label,
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  autoComplete,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputId = id || name || `input-${Math.random().toString(36).slice(2, 11)}`;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const inputClasses = `
    glass-input w-full
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${isFocused ? 'ring-2 ring-glass-blue/50' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        className={inputClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      
      {error && (
        <p 
          id={`${inputId}-error`}
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default GlassInput;