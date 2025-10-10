// src/pages/pi-sdk-check.jsx
import Head from 'next/head';
import { useEffect, useState } from 'react';

export async function getServerSideProps() {
  // Safe, public values only
  return {
    props: {
      NEXT_PUBLIC_PI_ENV: process.env.NEXT_PUBLIC_PI_ENV || null,
      NEXT_PUBLIC_PI_APP_ID: process.env.NEXT_PUBLIC_PI_APP_ID || null,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
    },
  };
}

export default function PiSdkCheck(props) {
  const [sdk, setSdk] = useState({
    present: false,
    version: null,
    canCreatePayment: false,
    details: '',
  });

  useEffect(() => {
    try {
      const hasPi = typeof window !== 'undefined' && !!window.Pi;
      const version = hasPi ? window.Pi?.version || 'unknown' : null;
      const canCreatePayment = hasPi && typeof window.Pi?.createPayment === 'function';
      setSdk({
        present: hasPi,
        version,
        canCreatePayment,
        details: hasPi ? 'window.Pi is present' : 'window.Pi not found',
      });
    } catch (e) {
      setSdk({ present: false, version: null, canCreatePayment: false, details: String(e) });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Pi SDK Check</title>
      </Head>
      <main style={{ fontFamily: 'system-ui, sans-serif', padding: 24, lineHeight: 1.5 }}>
        <h1>Pi SDK Check</h1>

        <section style={{ marginTop: 16 }}>
          <h2>Public Environment</h2>
          <ul>
            <li><b>NEXT_PUBLIC_PI_ENV:</b> {props.NEXT_PUBLIC_PI_ENV ?? '—'}</li>
            <li><b>NEXT_PUBLIC_PI_APP_ID:</b> {props.NEXT_PUBLIC_PI_APP_ID ?? '—'}</li>
            <li><b>NEXT_PUBLIC_SITE_URL:</b> {props.NEXT_PUBLIC_SITE_URL ?? '—'}</li>
          </ul>
        </section>

        <section style={{ marginTop: 16 }}>
          <h2>SDK</h2>
          <ul>
            <li><b>window.Pi present:</b> {sdk.present ? 'yes' : 'no'}</li>
            <li><b>Pi SDK version:</b> {sdk.version ?? '—'}</li>
            <li><b>createPayment available:</b> {sdk.canCreatePayment ? 'yes' : 'no'}</li>
            <li><b>Details:</b> {sdk.details}</li>
          </ul>
        </section>

        <p style={{ marginTop: 24, color: '#666' }}>
          If SDK is not present, confirm <code>_app.js</code> loads the Pi SDK script and that this domain is
          allowed in your Pi app settings.
        </p>
      </main>
    </>
  );
}
