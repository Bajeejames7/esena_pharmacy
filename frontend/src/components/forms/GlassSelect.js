import { useState, forwardRef } from 'react';

/**
 * Glass-styled select component with enhanced accessibility
 * Implements Requirements 1.1, 29.3, 29.5, 29.6
 */
const GlassSelect = forwardRef(({
  value,
  onChange,
  options = [],
  error,
  label,
  helperText,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const selectId = id || name || `select-${Math.random().toString(36).slice(2, 11)}`;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const selectClasses = `
    glass-input w-full min-h-[44px] pr-10
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${isFocused ? 'ring-2 ring-glass-blue/50' : ''}
    ${className}
  `;

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
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
          aria-describedby={`
            ${error ? errorId : ''} 
            ${helperText ? helperId : ''}
          `.trim() || undefined}
          aria-label={selectedOption ? `Selected: ${selectedOption.label}` : label}
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
              aria-label={option.description ? `${option.label} - ${option.description}` : option.label}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className="w-5 h-5 text-gray-400 dark:text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Helper text */}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-600 dark:text-gray-300">
          {helperText}
        </p>
      )}
      
      {/* Error message */}
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

GlassSelect.displayName = 'GlassSelect';

export default GlassSelect;