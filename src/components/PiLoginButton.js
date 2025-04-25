/* File: src/components/PiLoginButton.js */
'use client';
import { useState } from 'react';
import { verifyPiLogin } from '../lib/pi';

export default function PiLoginButton() {}
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const auth = await verifyPiLogin();
      const res = await fetch('/api/auth/pi-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auth),
      });
      if (!res.ok) throw new Error('Login API failed');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };