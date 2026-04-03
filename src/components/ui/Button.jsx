import { forwardRef } from 'react'

/**
 * Button – charte DosTracker
 * variants: primary | secondary | outline-orange | outline-green | ghost | danger
 * sizes: sm | md (default) | lg
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...props },
  ref
) {
  const variantClass = {
    primary:         'btn-primary',
    secondary:       'btn-secondary',
    'outline-orange': 'btn-outline-orange',
    'outline-green':  'btn-outline-green',
    ghost:           'btn-ghost',
    danger:          'btn-danger',
  }[variant] ?? 'btn-primary'

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size] ?? ''

  return (
    <button
      ref={ref}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button
