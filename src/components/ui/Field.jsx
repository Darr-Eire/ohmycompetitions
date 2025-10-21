// ============================================================================
// FILE: src/components/ui/Field.jsx
// ============================================================================
'use client';
export default function Field({ label, help, error, children, id }) {
  return (
    <div className="omc-field">
      {label && <label htmlFor={id} className="omc-label">{label}</label>}
      {children}
      {error ? <div className="omc-error">{error}</div> : help ? <div className="omc-help">{help}</div> : null}
    </div>
  );
}
