'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePiAuth } from '../context/PiAuthContext';

export default function SignupPage() {
  const { user, loginWithPi } = usePiAuth();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Capture referral code from URL parameter
  useEffect(() => {
    if (router.query.ref) {
      setReferralCode(router.query.ref);
    }
  }, [router.query.ref]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/account');
    }
  }, [user, router]);

  const handleSignup = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Store referral code in localStorage for the authentication process
      if (referralCode.trim()) {
        localStorage.setItem('pendingReferralCode', referralCode.trim());
      }

      // Authenticate with Pi Network (referral code will be automatically applied)
      await loginWithPi();

      setMessage('🎉 Account created successfully! Welcome to OhMyCompetitions!');
      setTimeout(() => {
        router.push('/account');
      }, 2000);

    } catch (error) {
      console.error('Signup failed:', error);
      setMessage('❌ Signup failed. Please try again.');
      // Clean up referral code if signup fails
      localStorage.removeItem('pendingReferralCode');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen flex items-center justify-center px-4">
      <div className="bg-[#1e293b] p-8 rounded-2xl border border-cyan-600 shadow-lg shadow-cyan-500/10 max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Join OhMyCompetitions
          </h1>
          <p className="text-cyan-400">
            Win amazing prizes with Pi Network!
          </p>
        </div>

        {/* Referral Code Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code (e.g., ABC12345)"
              className="w-full px-4 py-3 bg-[#0f172a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              maxLength={10}
            />
            {router.query.ref && (
              <p className="text-xs text-green-400 mt-1">
                ✅ Referral code detected from link
              </p>
            )}
          </div>

          {/* Benefits */}
          <div className="bg-[#0f172a] p-4 rounded-lg border border-green-500/30">
            <h3 className="text-green-400 font-semibold mb-2">🎁 Referral Benefits</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Get 5 bonus tickets when you sign up</li>
              <li>• Your referrer gets 5 bonus tickets too</li>
              <li>• Start with extra chances to win prizes</li>
              <li>• Join the Pi Network competition community</li>
            </ul>
          </div>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              Creating Account...
            </span>
          ) : (
            'Sign Up with Pi Network'
          )}
        </button>

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-lg text-center text-sm ${
            message.includes('❌') 
              ? 'bg-red-900/20 border border-red-500 text-red-400'
              : 'bg-green-900/20 border border-green-500 text-green-400'
          }`}>
            {message}
          </div>
        )}

        {/* Info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-400">
            By signing up, you agree to our terms and conditions
          </p>
          <p className="text-xs text-cyan-400">
            Already have an account?{' '}
            <button 
              onClick={() => router.push('/account')}
              className="underline hover:text-cyan-300"
            >
              Sign In
            </button>
          </p>
        </div>

        {/* How it Works */}
        <details className="bg-[#0f172a] rounded-lg border border-gray-600">
          <summary className="p-3 text-sm text-cyan-400 cursor-pointer hover:text-cyan-300">
            ℹ️ How Pi Network Signup Works
          </summary>
          <div className="p-3 pt-0 text-xs text-gray-300 space-y-1">
            <p>• Click "Sign Up with Pi Network" above</p>
            <p>• Authenticate using your Pi Network account</p>
            <p>• Your referral code will be automatically applied</p>
            <p>• Start entering competitions immediately</p>
          </div>
        </details>
      </div>
    </div>
  );
} 