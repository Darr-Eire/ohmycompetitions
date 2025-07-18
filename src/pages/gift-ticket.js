import React, { useState } from 'react';
import { usePiAuth } from 'context/PiAuthContext';
import Layout from 'components/Layout';
import GiftTicketModal from 'components/GiftTicketModal';

export default function GiftTicketPage() {
  const { user } = usePiAuth();
  const [showGiftModal, setShowGiftModal] = useState(false);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-cyan-900 text-white">
        <div className="container mx-auto px-4 py-16">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Gift a Ticket
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Share the excitement! Gift competition tickets to your friends and family on the Pi Network.
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            
            {/* How It Works */}
            <div className="bg-[#0f172a] border border-cyan-400 rounded-xl p-8 mb-8 shadow-[0_0_30px_#00f0ff33]">
              <h2 className="text-2xl font-bold mb-6 text-cyan-400">How Gifting Works</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black text-2xl font-bold">
                    1
                  </div>
                  <h3 className="font-bold mb-2">Choose Competition</h3>
                  <p className="text-gray-300 text-sm">Select from active competitions with amazing prizes</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black text-2xl font-bold">
                    2
                  </div>
                  <h3 className="font-bold mb-2">Enter Recipient</h3>
                  <p className="text-gray-300 text-sm">Add your friend's Pi Network username</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black text-2xl font-bold">
                    3
                  </div>
                  <h3 className="font-bold mb-2">Send Gift</h3>
                  <p className="text-gray-300 text-sm">Your friend receives the ticket instantly!</p>
                </div>
              </div>
            </div>

            {/* Gift Features */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-[#0f172a] border border-blue-400 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-400">✨ Features</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Instant delivery to recipient
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Gift up to 10 tickets at once
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    All active competitions available
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    Secure Pi Network authentication
                  </li>
                </ul>
              </div>

              <div className="bg-[#0f172a] border border-yellow-400 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-yellow-400">🎯 Perfect For</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-2">•</span>
                    Birthday gifts
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-2">•</span>
                    Holiday surprises
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-2">•</span>
                    Welcoming new Pioneers
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-400 mr-2">•</span>
                    Celebrating achievements
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Section */}
            <div className="text-center">
              {user?.username ? (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowGiftModal(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-bold py-4 px-8 rounded-xl text-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    🎁 Start Gifting Now
                  </button>
                  <p className="text-gray-400">
                    Logged in as: <span className="text-cyan-400 font-bold">{user.username}</span>
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-900/20 border border-yellow-500 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-yellow-400">Login Required</h3>
                  <p className="text-gray-300 mb-4">
                    Please log in with your Pi Network account to start gifting tickets to friends.
                  </p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Go to Login
                  </button>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center text-gray-400 text-sm">
              <p>
                Questions about gifting? Check our <a href="/help" className="text-cyan-400 hover:underline">help center</a> or 
                contact <a href="/contact" className="text-cyan-400 hover:underline">support</a>.
              </p>
            </div>
          </div>
        </div>

        {/* Gift Modal */}
        <GiftTicketModal 
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
        />
      </div>
    </Layout>
  );
} 