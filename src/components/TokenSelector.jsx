// components/TokenSelector.jsx
import React from 'react'

const tokens = ['BTC', 'ETH', 'SOL', 'ADA', 'DOGE', 'BNB']

export default function TokenSelector({ selected, onChange }) {
  return (
    <select
      className="bg-gray-900 text-cyan-300 border border-cyan-700 px-3 py-1 rounded-md text-sm"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      {tokens.map((token) => (
        <option key={token} value={token}>
          {token}
        </option>
      ))}
    </select>
  )
}
