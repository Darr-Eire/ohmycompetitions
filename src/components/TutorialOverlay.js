'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const tutorialSteps = [
  {
    title: 'Welcome to OMC',
    desc: 'Oh My Competitions is a Pi-powered platform where pioneers play, win and grow. Let’s give you the quick tour.',
  },
  {
    title: 'Login & Sign Up',
    desc: 'Tap “Login” or “Sign Up” to connect your Pi wallet. This secures your entries, tracks your wins and ensures fair play.',
  },
  {
    title: 'Navigation Menu',
    desc: 'Use the menu to explore all categories: Daily Draws, Pi Giveaways, Battles, Mini Games and Mystery Events.',
  },
  {
    title: 'Browse Competitions',
    desc: 'Each competition card shows a prize, entry cost in Pi and ticket availability. Tap one to view full prize details.',
  },
  {
    title: 'Enter & Buy Tickets',
    desc: 'Buy tickets using Pi. Each ticket has a unique ID linked to your account. The more you buy, the higher your odds.',
  },
  {
    title: 'Gift Tickets & Use Vouchers',
    desc: 'You can send tickets to friends or redeem voucher codes for free entries build community while increasing your chances.',
  },
  {
  title: 'You’re Ready to Play!',
  desc: `Thanks for checking out Oh My Competitions!

This platform is built by Pioneers for Pioneers with the power of Pi at its core. Every ticket, prize and experience is made possible by the Pi Network community.

We’re just getting started. Let’s build the future of fair, fun competitions together. ⚡️`,
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
      <div className="bg-[#0f1b33] text-white p-6 rounded-2xl max-w-sm w-full text-center shadow-[0_0_30px_#00fff055] border border-cyan-400 relative">

        {/* Step Counter */}
        <div className="absolute top-2 right-4 text-xs text-cyan-300">
          {step + 1} / {tutorialSteps.length}
        </div>

        {/* Title & Description */}
        <h2 className="text-xl font-bold bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-transparent bg-clip-text mb-3">
          {tutorialSteps[step].title}
        </h2>
        <p className="text-sm text-white/80 mb-5 leading-snug">
          {tutorialSteps[step].desc}
        </p>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {step < tutorialSteps.length - 1 && (
            <button
              onClick={skipTutorial}
              className="text-sm text-cyan-300 underline hover:text-red-400"
            >
              Skip
            </button>
          )}
          <button
            onClick={nextStep}
            className="bg-gradient-to-r from-[#00ffd5] to-[#0077ff] text-black font-bold px-4 py-2 rounded-md shadow-md hover:scale-105 transition"
          >
            {step === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
