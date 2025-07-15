'use client';

import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BuyTicketButton from '@components/BuyTicketButton';
import { usePiAuth } from '../../context/PiAuthContext';
import {
  techItems,
  premiumItems,
  piItems,
  dailyItems,
  freeItems,
  cryptoGiveawaysItems,
} from '../../data/competitions';

const flattenCompetitions = [
  ...techItems,
  ...premiumItems,
  ...piItems,
  ...dailyItems,
  ...freeItems,
  ...cryptoGiveawaysItems,
];

const COMPETITIONS = {};
flattenCompetitions.forEach((item) => {
  COMPETITIONS[item.comp.slug] = {
    ...item.comp,
    title: item.title,
    prize: item.prize,
    imageUrl: item.imageUrl,
    thumbnail: item.thumbnail || null,
    location: item.location || 'Online',
    date: item.date || 'N/A',
    time: item.time || 'N/A',
  };
});

const FREE_TICKET_COMPETITIONS = ['pi-to-the-moon'];
const DAILY_COMPETITIONS = ['daily-jackpot', 'everyday-pioneer', 'daily-pi-slice'];

// Multiple skill questions array
const skillQuestions = [
  { question: "What is 3 + 4?", answer: "7" },
  { question: "What color is the sky on a clear day?", answer: "blue" },
  { question: "What is 5 x 6?", answer: "30" },
  { question: "Type the word 'Pi'", answer: "pi" },
  { question: "What is 10 - 2?", answer: "8" },
  { question: "How many legs does a spider have?", answer: "8" },
  { question: "What color are bananas?", answer: "yellow" },
  { question: "What is the first letter of the English alphabet?", answer: "a" },
  { question: "What day comes after Monday?", answer: "tuesday" },
  { question: "How many days are in a week?", answer: "7" },
  { question: "What is the capital of France?", answer: "paris" },
  { question: "What shape has 3 sides?", answer: "triangle" },
  { question: "What color is grass?", answer: "green" },
  { question: "What is 3 + 4?", answer: "7" },
  { question: "What color is the sky on a clear day?", answer: "blue" },
  { question: "What is 5 x 6?", answer: "30" },
  { question: "Type the word 'Pi'", answer: "pi" }, // lowercase to match
  { question: "What is 10 - 2?", answer: "8" },
  { question: "How many legs does a spider have?", answer: "8" },
  { question: "What color are bananas?", answer: "yellow" },
  { question: "What is the first letter of the English alphabet?", answer: "a" },
  { question: "What day comes after Monday?", answer: "tuesday" },
  { question: "How many days are in a week?", answer: "7" },
  { question: "What is the capital of France?", answer: "paris" },
  { question: "What shape has 3 sides?", answer: "triangle" },
  { question: "What color is grass?", answer: "green" },
];



export default function TicketPurchasePage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user, login, isAuthenticated } = usePiAuth();

  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sharedBonus, setSharedBonus] = useState(false);
  const [competitionStatus, setCompetitionStatus] = useState('active');
  const [showSkillQuestion, setShowSkillQuestion] = useState(false);
  const [skillAnswer, setSkillAnswer] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [liveTicketsSold, setLiveTicketsSold] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [stuckPaymentId, setStuckPaymentId] = useState(null);
  const [recovering, setRecovering] = useState(false);

  // New state for dynamic competition description
  const [description, setDescription] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const isFree = comp?.paymentType === 'free';
  const isDaily = comp?.theme === 'daily';

  const mainImage = comp?.imageUrl;
  const thumbnailImage = comp?.thumbnail;

  // Helper function to check if URL is external
  const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const fetchCompetition = async (slugParam) => {
    if (!slugParam) return;

    try {
      setLoading(true);

      // First try to fetch from API (live data)
      try {
        const response = await fetch(`/api/competitions/${slugParam}`);
        if (response.ok) {
          const liveComp = await response.json();
          console.log('✅ Fetched live competition data:', liveComp);
          setComp(liveComp);
          setLiveTicketsSold(liveComp.ticketsSold || 0);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.warn('⚠️ Failed to fetch from API, using static data:', apiError);
      }

      // Fallback to static data
      const staticComp = flattenCompetitions.find(c => c.comp.slug === slugParam);
      if (staticComp) {
        console.log('📁 Using static competition data:', staticComp);
     setComp({
  ...staticComp.comp,
  title: staticComp.title,
  prize: staticComp.prize,

  thumbnail: staticComp.thumbnail,
  location: staticComp.location,
  date: staticComp.date,
  time: staticComp.time,
});

        setLiveTicketsSold(staticComp.comp.ticketsSold || 0);
      } else {
        setError('Competition not found');
      }
    } catch (err) {
      console.error('❌ Error fetching competition:', err);
      setError('Failed to load competition');
    } finally {
      setLoading(false);
    }
  };

  // Dynamically import the description file based on comp.slug
  useEffect(() => {
    if (!comp?.slug) {
      setDescription('');
      return;
    }
const loadDescription = async () => {
  try {
    const descModule = await import(`../../data/descriptions/${comp.slug}.js`);
    const desc = descModule.default;
    if (typeof desc === 'string') {
      setDescription(desc);
    } else if (desc && typeof desc.description === 'string') {
      setDescription(desc.description);
    } else {
      setDescription('No detailed description available for this competition.');
    }
  } catch (e) {
    console.warn(`Description file not found for slug: ${comp.slug}`);
    setDescription('No detailed description available for this competition.');
  }
};



    loadDescription();
  }, [comp?.slug]);

  useEffect(() => {
    if (!router.isReady || !slug) return;

    fetchCompetition(slug);
  }, [router.isReady, slug]);

  useEffect(() => {
    if (!slug || !isFree) return;
    const saved = parseInt(localStorage.getItem(`${slug}-claimed`) || 0);
    setQuantity(saved || 1);
    setSharedBonus(localStorage.getItem(`${slug}-shared`) === 'true');
  }, [slug]);

  const claimFreeTicket = () => {
    const maxTickets = sharedBonus ? 2 : 1;
    if (quantity >= maxTickets) {
      alert('You have claimed the maximum tickets.');
      return;
    }
    const updated = quantity + 1;
    setQuantity(updated);
    localStorage.setItem(`${slug}-claimed`, updated);
  };

  const handleShare = () => {
    if (sharedBonus) {
      alert('You already received your bonus ticket.');
      return;
    }
    setSharedBonus(true);
    localStorage.setItem(`${slug}-shared`, 'true');
    claimFreeTicket();
  };

  const handlePaymentSuccess = async (result) => {
    console.log('🎉 Payment successful, refreshing competition data:', result);

    if (result.ticketQuantity) {
      setLiveTicketsSold(prev => prev + result.ticketQuantity);
    }

    try {
      await fetchCompetition(slug);

      const ticketText = result.ticketNumber?.toString().includes('-')
        ? `ticket numbers ${result.ticketNumber}`
        : `ticket number ${result.ticketNumber}`;

      const message = result.competitionStatus === 'completed'
        ? `🎉 Success! Your ${ticketText}. This competition is now SOLD OUT!`
        : `🎉 Success! Your ${ticketText}. Updated tickets available!`;

      alert(message);

      if (result.competitionStatus === 'completed') {
        setTimeout(() => {
          alert('🚀 This competition is now SOLD OUT! The draw will happen soon.');
        }, 2000);
      }
    } catch (refreshError) {
      console.error('❌ Failed to refresh competition data:', refreshError);
    }
  };

  useEffect(() => {
    if (!comp) return;

    const checkStatus = () => {
      const now = Date.now();
      const start = new Date(comp.startsAt).getTime();
      const end = new Date(comp.endsAt).getTime();

      if (now < start) {
        setCompetitionStatus('upcoming');
      } else if (now > end) {
        setCompetitionStatus('ended');
      } else {
        setCompetitionStatus('active');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [comp]);

  // On clicking proceed, pick a random question and show it
  const handleShowSkillQuestion = () => {
    const randomIndex = Math.floor(Math.random() * skillQuestions.length);
    setSelectedQuestion(skillQuestions[randomIndex]);
    setSkillAnswer('');
    setShowSkillQuestion(true);
  };

  // Validate answer ignoring case and whitespace
  const isAnswerCorrect = () => {
    if (!selectedQuestion) return false;
    return skillAnswer.trim().toLowerCase() === selectedQuestion.answer.toLowerCase();
  };

  if (!router.isReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (error || !comp) {
    return (
      <div className="p-6 text-center text-white bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Competition Not Found</h1>
        <p className="mt-4">We couldn't find "{slug}".</p>
        <Link href="/" className="mt-6 inline-block text-blue-400 underline font-semibold">Back to Home</Link>
      </div>
    );
  }

  const totalPrice = (comp?.entryFee || 0) * quantity;
  const ticketsSold = liveTicketsSold || comp?.ticketsSold || 0;
  const totalTickets = comp?.totalTickets || 100;
  const availableTickets = Math.max(0, totalTickets - ticketsSold);
  const isSoldOut = ticketsSold >= totalTickets;
  const isNearlyFull = availableTickets <= totalTickets * 0.1; // Less than 10% remaining

  if (isSoldOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4">
        <div className="max-w-md w-full bg-red-900/20 border-2 border-red-500 rounded-xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Competition Sold Out</h1>
          <p className="text-white mb-2">
            <strong>{comp.title}</strong> has sold all {totalTickets.toLocaleString()} tickets.
          </p>
          <p className="text-gray-300 mb-6">
            Check out our other exciting competitions or be the first to know when new competitions launch!
          </p>
          <div className="space-y-3">
            <Link href="/" className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
              Browse Other Competitions
            </Link>
            <Link href="/account" className="block w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition">
              View My Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 text-white bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] font-orbitron">
      <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-lg border border-cyan-400 rounded-2xl shadow-[0_0_60px_#00ffd577] p-6">
        <div className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 p-[2px] rounded-xl mb-4">
          <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-lg px-4 py-3 font-orbitron">
            <h1 className="text-center text-white text-2xl sm:text-3xl font-extrabold tracking-wide uppercase drop-shadow-md">
              {comp.title}
            </h1>
          </div>
        </div>

        <div className="space-y-6 text-center">
          {!isDaily && mainImage && (
            <>
              {isExternalUrl(mainImage) ? (
                <img
                  src={mainImage}
                  alt={comp.title}
                  className="w-full max-h-64 object-cover rounded-lg border border-blue-500 mx-auto"
                />
              ) : (
                <Image
                  src={mainImage}
                  alt={comp.title}
                  width={600}
                  height={300}
                  className="w-full max-h-64 object-cover rounded-lg border border-blue-500 mx-auto"
                />
              )}
              {thumbnailImage && (
                <div className="flex justify-center mt-2 px-2">
                  {isExternalUrl(thumbnailImage) ? (
                    <img
                      src={thumbnailImage}
                      alt="Competition thumbnail"
                      className="rounded-lg border border-cyan-400 object-cover w-24 h-16 sm:w-32 sm:h-20"
                    />
                  ) : (
                    <Image
                      src={thumbnailImage}
                      alt="Competition thumbnail"
                      width={100}
                      height={60}
                      className="rounded-lg border border-cyan-400 object-cover w-24 h-16 sm:w-32 sm:h-20"
                    />
                  )}
                </div>
              )}
            </>
          )}

          <div className="text-center">
            <p className="text-white text-2xl font-bold">{comp.prize}</p>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-sm text-cyan-300 hover:text-white transition underline"
            >
              {showDetails ? 'Hide' : 'View'} Competition Details
            </button>

            {showDetails && (
              <div className="mt-3 text-sm bg-white/10 border border-cyan-400 rounded-lg p-4 text-left max-w-md mx-auto whitespace-pre-wrap text-white/80">
                {description}
              </div>
            )}
          </div>
<div className="max-w-md mx-auto text-sm text-white space-y-2">
  <div className="flex justify-between">
    <span className="font-semibold">Starts On</span>
    <span>
      {comp.startsAt
        ? new Date(comp.startsAt).toLocaleDateString('en-GB')
        : 'TBA'}
    </span>
  </div>
  <div className="flex justify-between">
    <span className="font-semibold">Draw Takes Place</span>
    <span>
      {comp.endsAt
        ? new Date(comp.endsAt).toLocaleDateString('en-GB')
        : 'TBA'}
    </span>
  </div>

  <div className="flex justify-between">
    <span className="font-semibold">Entry Fee</span>
    <span>{comp.entryFee.toFixed(2)} π</span>
  </div>
  <div className="flex justify-between">
    <span className="font-semibold">Max Ticket Purchases</span>
    <span>
      {comp.maxTicketsPerUser
        ? comp.maxTicketsPerUser.toLocaleString()
        : '10'}
    </span>
  </div>
  <div className="flex justify-between">
    <span className="font-semibold">Tickets Sold</span>
    <span className={`${liveTicketsSold >= comp.totalTickets ? 'text-red-400 font-bold' : ''}`}>
      {liveTicketsSold} / {comp.totalTickets}
      {liveTicketsSold >= comp.totalTickets && ' (SOLD OUT)'}
    </span>
  </div>
  {liveTicketsSold > 0 && (
    <div className="flex justify-between text-cyan-400">
      <span className="font-semibold">Available</span>
      <span>{Math.max(0, comp.totalTickets - liveTicketsSold)} tickets remaining</span>
    </div>
  )}
</div>


          {isFree ? (
            <>
              <p className="text-cyan-300 font-semibold text-lg">Free Ticket Claimed: {quantity}/2</p>
              <button
                onClick={claimFreeTicket}
                disabled={quantity >= (sharedBonus ? 2 : 1)}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl mb-3"
              >
                Claim Free Ticket
              </button>
              {!sharedBonus && (
                <button
                  onClick={handleShare}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-4 rounded-xl"
                >
                  Share for Bonus Ticket
                </button>
              )}
            </>
          ) : (
            <>
              {!user && (
                <div className="text-sm bg-red-600 p-3 rounded-lg font-semibold">
                  Please{' '}
                  <button onClick={login} className="underline text-cyan-200">
                    log in
                  </button>{' '}
                  with Pi to buy tickets.
                </div>
              )}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="bg-blue-500 px-4 py-1 rounded-full disabled:opacity-50"
                >
                  −
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(availableTickets, q + 1))}
                  disabled={quantity >= availableTickets}
                  className="bg-blue-500 px-4 py-1 rounded-full disabled:opacity-50"
                >
                  +
                </button>
              </div>
              {isNearlyFull && availableTickets > 0 && (
                <div className="text-orange-400 text-sm font-bold mt-2">
                  ⚠️ Only {availableTickets} tickets remaining!
                </div>
              )}
              {quantity > availableTickets && (
                <div className="text-red-400 text-sm font-bold mt-2">
                  ❌ Cannot buy {quantity} tickets - only {availableTickets} available
                </div>
              )}
              <p className="text-lg font-bold mt-6">
                Total {totalPrice.toFixed(2)} π
              </p>
<p className="text-white text-sm mt-2">
  Secure your entry to win <strong>{comp.prize}</strong>.<br />
  Thank you for participating and good luck! 🚀✨
</p>


              {!showSkillQuestion ? (
                <button
                  onClick={handleShowSkillQuestion}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl mt-6"
                >
                  Proceed to Payment
                </button>
              ) : (
                <div className="mt-6 max-w-md mx-auto text-center">
                  <label htmlFor="skill-question" className="block font-semibold mb-1 text-white">
                    Skill Question (Required to Enter):
                  </label>
                  <p className="mb-2">{selectedQuestion?.question}</p>
                  <input
                    id="skill-question"
                    type="text"
                    className="w-full px-4 py-2 rounded-lg bg-[#0f172a]/60 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 mx-auto"
                    value={skillAnswer}
                    onChange={(e) => setSkillAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    style={{ maxWidth: '300px' }}
                  />
                  {!isAnswerCorrect() && skillAnswer !== '' && (
                    <p className="text-sm text-red-400 mt-1">
                      You must answer correctly to proceed.
                    </p>
                  )}
                  {isAnswerCorrect() && (
                    <BuyTicketButton
                      competitionSlug={slug}
                      entryFee={comp.entryFee}
                      quantity={quantity}
                      piUser={user}
                      onPaymentSuccess={handlePaymentSuccess}
                      endsAt={comp.endsAt}
                    />
                  )}
                </div>
              )}
            </>
          )}

          <div className="mt-6 text-xs text-white flex flex-col items-center space-y-2">
            <Link
              href="/terms-conditions"
              className="underline hover:text-cyan-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
