// ============================================================================
// FILE: src/components/ui/Card.jsx
// ============================================================================
'use client';
export default function Card({ children, className = '' }) {
  return <div className={`omc-card p-4 ${className}`}>{children}</div>;
}
