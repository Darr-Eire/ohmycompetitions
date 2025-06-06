// src/pages/_app.js

import React from 'react';
import { PiAuthProvider } from '../context/PiAuthContext';
import Layout from '../components/Layout';
import '@fontsource/orbitron';
import 'styles/globals.css';  // ✅ use correct relative path for styles

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <Layout>{page}</Layout>);

  return (
    <PiAuthProvider>
      {getLayout(<Component {...pageProps} />)}
    </PiAuthProvider>
  );
}
