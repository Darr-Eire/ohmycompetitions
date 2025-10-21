// ============================================================================
// FILE: src/components/ui/Button.jsx
// Purpose: One button to rule them all
// ============================================================================
'use client';
export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const v =
    variant === 'primary' ? 'omc-btn omc-btn-primary' :
    variant === 'ghost'   ? 'omc-btn omc-btn-ghost'   :
    'omc-btn omc-btn-outline';
  const s = size === 'lg' ? 'omc-btn-lg' : size === 'sm' ? 'omc-btn-sm' : '';
  return (
    <button className={`${v} ${s} ${className}`} {...props}>
      {children}
    </button>
  );
}
