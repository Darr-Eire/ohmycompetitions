'use client';
export function Heading({ title, subtitle }) {
  return (
    <div className="text-center leading-tight">
      <span className="omc-title">{title}</span>
      <div className="omc-subtitle mt-0.5" aria-live="polite">
        {subtitle ? subtitle : <span className="opacity-0 select-none">placeholder</span>}
      </div>
    </div>
  );
}
export default Heading;
