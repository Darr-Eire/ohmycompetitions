// src/pages/_app.js

import React, { useEffect } from 'react';
import { PiAuthProvider } from '../context/PiAuthContext';
import Layout from '../components/Layout';
import '@fontsource/orbitron';
import '../../styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // 🔗 Capture referral once per session
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref && !localStorage.getItem('referral_user')) {
        localStorage.setItem('referral_user', ref);
        console.log('🔗 Referral captured:', ref);
      }
    }

    // 🧠 Inject Pi SDK if not already available
    if (typeof window !== 'undefined' && !window.Pi) {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => console.log('✅ Pi SDK loaded');
    }
  }, []);

  // Optional custom layouts
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <PiAuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </PiAuthProvider>
  );
}
