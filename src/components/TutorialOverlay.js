'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const tutorialSteps = [
  {
    title: 'Welcome to OMC',
    desc: 'Oh My Competitions is a Pi-powered platform where pioneers play, win and grow. Let’s give you the quick tour of how to get started and what you can do on the platform.',
  },
  {
    title: 'Login & Sign Up',
    desc: 'At the top right corner, tap “Login” or “Sign Up” to connect your Pi account and wallet. This secures your entries, tracks your wins and ensures fair play. You need to be logged in to join competitions or gift tickets.',
  },
  {
    title: 'Navigation Menu',
    desc: 'Tap the menu icon (☰) in the top-left corner to open the navigation drawer. From there, explore all sections like: Daily Draws, Pi Giveaways, Pi Battles, Mini Games and Mystery Events.',
  },
  {
    title: 'Browse Competitions',
    desc: 'Scroll down the homepage or category pages to view competition cards. Each card shows the prize, Pi entry cost, number of tickets available and the deadline to enter. Tap on a card for full prize details.',
  },
  {
    title: 'Enter & Buy Tickets',
    desc: 'On a competition page, use the “Buy Tickets” section to enter using your Pi wallet. Each ticket has a unique ID tied to your account. The more you buy, the better your odds of winning!',
  },
{
  title: 'Gift Tickets & Use Vouchers',
  desc: 'Below the Buy button on any competition page, you’ll find options to gift a ticket to a friend or redeem a voucher code. You can also send tickets directly from the “My Account” page under gift tickets. This helps grow the community while giving others a chance to win too',
},

  {
    title: 'You’re Ready to Play!',
    desc: `Thanks for checking out Oh My Competitions!

Every ticket you buy, gift and prize you win is powered by the Pi Network community. Built by Pioneers, for Pioneers OMC is here to make competitions fun, fair and rewarding.

Let’s build the future together. ⚡️`,
  },
];


export default function TutorialOverlay({ forceShow = false }) {
  const [show, setShow] = useState(forceShow);
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const hasSeen = localStorage.getItem('seenTutorial');
    if (!hasSeen && !forceShow) {
      setShow(true);
    }
  }, [forceShow]);

  const endTutorial = () => {
    setShow(false);
    if (!forceShow) {
      localStorage.setItem('seenTutorial', 'true');
    }
    router.push('/homepage');
  };

  const nextStep = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1);
    } else {
      endTutorial();
    }
  };

  const skipTutorial = () => {
    endTutorial();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[#0a1024]/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-[#0f1b33] text-white p-6 rounded-2xl max-w-sm w-full text-center shadow-[0_0_30px_#00fff055] border border-cyan-400 transition-all duration-300 ease-in-out scale-100 animate-fadeIn">
        
        {/* Step Counter */}
        <div className="absolute top-2 right-4 text-xs text-cyan-300 font-medium">
          {step + 1} / {tutorialSteps.length}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-cyan-900 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-cyan-400 transition-all duration-300"
            style={{ width: `${((step + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text mb-3 tracking-wide leading-snug">
          {tutorialSteps[step].title}
        </h2>

        {/* Description */}
        <p className="text-sm text-white/80 mb-6 leading-relaxed whitespace-pre-line">
          {tutorialSteps[step].desc}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mb-4 flex-wrap">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-cyan-300 underline hover:text-blue-400 transition"
            >
              Back
            </button>
          )}
          {step < tutorialSteps.length - 1 && (
            <button
              onClick={skipTutorial}
              className="text-sm text-cyan-300 underline hover:text-red-400 transition"
            >
              Skip
            </button>
          )}
          <button
            onClick={nextStep}
            className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold px-5 py-2 rounded-lg shadow-md hover:scale-105 transition"
          >
            {step === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mb-3">
          {tutorialSteps.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === step ? 'bg-cyan-300' : 'bg-cyan-700'
              }`}
            />
          ))}
        </div>

        {/* "Don’t show again" Checkbox */}
        <div className="text-left">
          <label className="text-xs text-white/70 cursor-pointer">
            <input
              type="checkbox"
              className="mr-2 accent-cyan-400"
              onChange={(e) =>
                localStorage.setItem('seenTutorial', e.target.checked ? 'true' : 'false')
              }
            />
            Don’t show this tutorial again
          </label>
        </div>
      </div>
    </div>
  );
}
