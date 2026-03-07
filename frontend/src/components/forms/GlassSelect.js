import React, { useState } from 'react';

/**
 * Glass-styled select component
 * Implements Requirements 1.1, 29.5, 29.6
 */
const GlassSelect = ({
  value,
  onChange,
  options = [],
  error,
  label,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const selectClasses = `
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
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={selectClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p 
          id={`${selectId}-error`}
          className="text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default GlassSelect;