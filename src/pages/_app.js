// src/pages/_app.js

import React, { useEffect } from 'react';
import { PiAuthProvider } from '../context/PiAuthContext';
import Layout from '../components/Layout';
import '@fontsource/orbitron';
import '../../styles/globals.css';


export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 🔗 Capture referral once per session
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !localStorage.getItem('referral_user')) {
      localStorage.setItem('referral_user', ref);
      console.log('🔗 Referral captured:', ref);
    }

    // 🧠 Inject Pi SDK script once
    if (!window.Pi) {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      script.onload = () => console.log('✅ Pi SDK loaded');
      document.head.appendChild(script);
    }
  }, []);

  // Support for per-page custom layouts
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <PiAuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </PiAuthProvider>
  );
}
