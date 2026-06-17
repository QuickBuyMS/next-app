'use client';

/**
 * Styled text input with label, error message, and icon support
 */
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  icon,
  register,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="input-group__label">
          {label}
        </label>
      )}
      <div className="input-group__wrapper">
        {icon && <span className="input-group__icon">{icon}</span>}
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          className={`input-group__field ${icon ? 'input-group__field--with-icon' : ''}`}
          autoComplete={isPassword ? 'current-password' : 'off'}
          {...(register ? register(name) : {})}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-group__toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="input-group__error">{error}</p>}
    </div>
  );
}
