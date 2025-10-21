// ============================================================================
// FILE: src/components/ui/Badge.jsx
// ============================================================================
'use client';
export default function Badge({ children, accent = false, className = '' }) {
  return <span className={`omc-badge ${accent ? 'omc-badge--accent' : ''} ${className}`}>{children}</span>;
}
