import React from 'react';
import './FlipClock.css';

export default function FlipClockUnit({ value, label }) {
  return (
    <div className="flip-clock-unit">
      <div className="card">
        <span className="top">{value}</span>
        <span className="bottom">{value}</span>
      </div>
      <span className="label">{label}</span>
    </div>
  );
}
