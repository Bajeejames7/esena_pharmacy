import { useState, forwardRef } from 'react';

/**
 * Glass-styled textarea component with enhanced accessibility
 * Implements Requirements 1.1, 29.3, 29.5, 29.6
 */
const GlassTextarea = forwardRef(({
  value,
  onChange,
  placeholder,
  error,
  label,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
  id,
  name,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const textareaId = id || name || `textarea-${Math.random().toString(36).slice(2, 11)}`;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const textareaClasses = `
    glass-input w-full resize-none min-h-[44px]
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/50' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${isFocused ? 'ring-2 ring-glass-blue/50' : ''}
    ${className}
  `;

  const characterCount = value ? value.length : 0;
  const isOverLimit = maxLength && characterCount > maxLength;

  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
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
        aria-describedby={`
          ${error ? errorId : ''} 
          ${helperText ? helperId : ''}
        `.trim() || undefined}
        {...props}
      />
      
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {helperText && !error && (
            <p id={helperId} className="text-sm text-gray-600">
              {helperText}
            </p>
          )}
          
          {error && (
            <p 
              id={errorId}
              className="text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
        
        {maxLength && (
          <p 
            className={`text-sm ml-4 ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}
            aria-live="polite"
            aria-label={`Character count: ${characterCount} of ${maxLength}`}
          >
            {characterCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

GlassTextarea.displayName = 'GlassTextarea';

export default GlassTextarea;