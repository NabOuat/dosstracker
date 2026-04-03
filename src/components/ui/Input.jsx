import { forwardRef } from 'react'

/**
 * Input – charte DosTracker
 * status: '' (default) | success | error
 */
const Input = forwardRef(function Input(
  { label, hint, status = '', required = false, className = '', id, value, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[0.78rem] font-bold text-neutral-700 tracking-[0.02em]"
        >
          {label}
          {required && <span className="text-orange ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`input-field ${status} ${className}`}
        value={value ?? ''}
        {...props}
      />
      {hint && (
        <p className={`text-[0.72rem] ${status === 'error' ? 'text-red-500' : 'text-neutral-400'}`}>
          {hint}
        </p>
      )}
    </div>
  )
})

export default Input
