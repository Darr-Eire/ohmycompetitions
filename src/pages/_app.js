// src/pages/_app.js

import React, { useEffect } from 'react';
import { PiAuthProvider } from '../context/PiAuthContext';
import Layout from '../components/Layout';
import '@fontsource/orbitron';
import '../styles/globals.css';  // ✅ corrected path

export default function App({ Component, pageProps }) {

  useEffect(() => {
    // ✅ Capture referral once per session if exists in URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !localStorage.getItem('referral_user')) {
      localStorage.setItem('referral_user', ref);
      console.log('Referral captured:', ref);
    }
  }, []);

  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <PiAuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </PiAuthProvider>
  );
}
