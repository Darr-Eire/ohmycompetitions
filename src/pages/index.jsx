// src/pages/index.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaXTwitter, FaFacebookF, FaDiscord, FaInstagram } from 'react-icons/fa6';

// Debug panel for Pi SDK sandbox testing
function PiDebugPanel() {
  const [sdkStatus, setSdkStatus] = useState('Loading...');
  const [testResult, setTestResult] = useState('');
  const [envInfo, setEnvInfo] = useState('');

  useEffect(() => {
    const info = {
      hostname: window.location.hostname,
      url: window.location.href,
      userAgent: navigator.userAgent.includes('PiBrowser') ? 'Pi Browser' : 'Regular Browser',
      nodeEnv: process.env.NODE_ENV || 'undefined',
    };
    setEnvInfo(`Environment: ${info.nodeEnv} | ${info.userAgent} | ${info.hostname}`);

    const checkSdk = () => {
      if (typeof window === 'undefined') return;

      if (window.Pi) {
        try {
          // Force sandbox mode for development testing
          window.Pi.init({ version: '2.0', sandbox: true });
          setSdkStatus('✅ Pi SDK Ready (SANDBOX MODE FORCED)');
        } catch (err) {
          setSdkStatus(`❌ Pi SDK Error: ${err.message}`);
        }
      } else {
        setSdkStatus('❌ Pi SDK Not Loaded - Loading script...');
        loadPiSdkScript();
      }
    };

    checkSdk();
    setTimeout(checkSdk, 2000);
    setTimeout(checkSdk, 5000);
  }, []);

  const loadPiSdkScript = () => {
    if (document.querySelector('script[src*="pi-sdk.js"]')) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      setTimeout(() => {
        if (window.Pi) {
          window.Pi.init({ version: '2.0', sandbox: true });
          setSdkStatus('✅ Pi SDK Loaded and Ready (SANDBOX MODE)');
        }
      }, 1000);
    };
    document.head.appendChild(script);
  };

  const testPiAuth = async () => {
    if (!window.Pi) {
      setTestResult('❌ Pi SDK not available');
      return;
    }

    if (typeof window.Pi.authenticate !== 'function') {
      setTestResult('❌ Pi SDK authenticate function not available');
      return;
    }

    try {
      setTestResult('🔄 Starting Pi authentication...');
      console.log('🔐 Pi authentication starting...');
      console.log('Current URL:', window.location.href);
      console.log('Pi SDK object:', window.Pi);

      const scopes = ['username', 'payments'];

      const onIncompletePaymentFound = (payment) => {
        console.log('⚠️ Incomplete payment found:', payment);
        setTestResult('⚠️ Incomplete payment found, handling...');
      };

      console.log('🔄 Calling Pi.authenticate with scopes:', scopes);
      const result = await window.Pi.authenticate(scopes, onIncompletePaymentFound);

      console.log('✅ Authentication result:', result);
      setTestResult(`✅ Success: ${result.user.username} (${result.user.uid})`);
    } catch (err) {
      console.error('❌ Authentication error:', err);
      let errorMsg = '❌ Failed: ';
      if (err.message?.includes('postMessage')) {
        errorMsg += 'Domain not configured in Pi Developer Portal';
      } else if (err.message?.includes('timeout')) {
        errorMsg += 'Authentication timeout';
      } else if (err.message?.includes('cancelled')) {
        errorMsg += 'User cancelled authentication';
      } else if (err.message?.includes('network')) {
        errorMsg += 'Network error - check connection';
      } else {
        errorMsg += err.message || 'Unknown error';
      }
      setTestResult(errorMsg);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: '#1e293b',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        border: '2px solid #00ff00',
        fontSize: '11px',
        zIndex: 9999,
        maxWidth: '350px',
      }}
    >
      <h4 style={{ margin: '0 0 10px 0', color: '#00ff00' }}>🧪 SANDBOX MODE TEST</h4>
      <div
        style={{
          background: '#0f172a',
          padding: '5px',
          borderRadius: '4px',
          marginBottom: '8px',
        }}
      >
        <small>{envInfo}</small>
      </div>
      <p style={{ margin: '5px 0' }}>{sdkStatus}</p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          marginTop: '5px',
        }}
      >
        <button
          onClick={testPiAuth}
          style={{
            background: '#00ff00',
            color: '#000',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Test Pi Login
        </button>
        <button
          onClick={() => {
            console.log('🔍 Pi SDK Debug Info:');
            console.log('Pi object:', window.Pi);
            console.log('Pi.authenticate available:', typeof window.Pi?.authenticate);
            console.log('Current origin:', window.location.origin);
            console.log('User agent:', navigator.userAgent);
            setTestResult('🔍 Check browser console for debug info');
          }}
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '10px',
          }}
        >
          Debug Info
        </button>
      </div>
      {testResult && (
        <p
          style={{
            marginTop: '5px',
            color: testResult.includes('Success') ? '#00ff00' : '#ff6b6b',
          }}
        >
          {testResult}
        </p>
      )}
    </div>
  );
}

export default function IndexPage() {
  const features = [
    { icon: '🔄', text: 'Daily Competitions', href: '/competitions/daily' },
    { icon: '🚀', text: 'Launch Week', href: '/competitions/launch-week' },
    { icon: '🎁', text: 'Pi Giveaways', href: '/competitions/pi' },
    { icon: '🏆', text: 'Pi Stages', href: '/battles' },
    { icon: '🎮', text: 'Mini Games', href: '/try-your-luck' },
    { icon: '❓', text: 'Mystery Features', href: '' },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#0a1024] text-white px-2 py-0 overflow-y-auto">
      <div className="w-full max-w-[420px] mx-auto flex flex-col gap-8">
        {/* Main Box */}
        <div className="bg-[#0f1b33] border border-cyan-400 rounded-3xl p-6 shadow-[0_0_30px_#00f0ff88] flex flex-col gap-5">
          {/* Title + Tagline */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text tracking-wide leading-tight">
              Oh My Competitions
            </h1>
            <p className="text-white text-sm mt-1">
              Built by Pioneers. For Pioneers. All Powered by Pi.
            </p>
          </div>

          {/* About OMC Section */}
          <div className="bg-[#0a1024]/90 border border-cyan-600 rounded-lg px-4 py-4 shadow-[0_0_20px_#00fff055] text-sm leading-relaxed">
            <h2 className="text-base font-bold text-cyan-300 mb-2 text-center">
              What is Oh My Competitions
            </h2>
            <p className="text-white">
              OMC is a decentralized platform where Pioneers compete in fun, fair competitions using Pi as currency. Every experience is powered by Pi.
            </p>
            <ul className="list-disc pl-5 mt-3 text-cyan-200 space-y-1">
              <li>🔁 Peer-to-peer Pi transactions</li>
              <li>🎫 Unique, trackable ticket IDs</li>
              <li>🤝 Giftable tickets and Pi vouchers</li>
              <li>🎉 Multiple winners, real rewards</li>
            </ul>
          </div>

          <Link
            href="/tutorial"
            className="text-center block mx-auto text-sm text-cyan-300 underline hover:text-cyan-100"
          >
            View Tutorial
          </Link>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-1 text-sm">
            {features.map((f, i) => (
              <Link
                key={i}
                href={f.href}
                className="flex items-center gap-2 px-3 py-2 bg-[#0a1024] border border-cyan-500 rounded-md shadow-[0_0_8px_#00f0ff33] hover:border-cyan-300 transition"
              >
                <span className="text-lg">{f.icon}</span>
                <span>{f.text}</span>
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-1">
            <Link
              href="/homepage"
              className="pulse-button block w-full bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold py-3 rounded-lg shadow-md text-center text-base"
            >
              Let’s Go
            </Link>
          </div>
        </div>
      </div>

      {/* Pi Debug Panel */}
      <PiDebugPanel />
    </div>
  );
}

IndexPage.getLayout = function PageLayout(page) {
  return <>{page}</>;
};
