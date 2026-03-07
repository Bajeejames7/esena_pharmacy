import React, { useState } from 'react';

/**
 * Glass-styled textarea component
 * Implements Requirements 1.1, 29.5, 29.6
 */
const GlassTextarea = ({
  value,
  onChange,
  placeholder,
  error,
  label,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
  id,
  name,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const textareaId = id || name || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const textareaClasses = `
    glass-input w-full resize-none
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${isFocused ? 'ring-2 ring-glass-blue/50' : ''}
    ${className}
  `;

  const characterCount = value ? value.length : 0;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className={textareaClasses}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      
      <div className="flex justify-between items-center">
        {error && (
          <p 
            id={`${textareaId}-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {maxLength && (
          <p className="text-sm text-gray-500 ml-auto">
            {characterCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default GlassTextarea;