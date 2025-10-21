// ============================================================================
// FILE: src/components/ui/Input.jsx
// ============================================================================
'use client';
import Field from './Field';
export function Input({ label, help, error, id, className = '', ...props }) {
  return (
    <Field label={label} help={help} error={error} id={id}>
      <input id={id} className={`omc-input ${className}`} {...props} />
    </Field>
  );
}
export function Textarea({ label, help, error, id, className = '', ...props }) {
  return (
    <Field label={label} help={help} error={error} id={id}>
      <textarea id={id} className={`omc-textarea ${className}`} {...props} />
    </Field>
  );
}
export function Select({ label, help, error, id, className = '', children, ...props }) {
  return (
    <Field label={label} help={help} error={error} id={id}>
      <select id={id} className={`omc-select ${className}`} {...props}>
        {children}
      </select>
    </Field>
  );
}
