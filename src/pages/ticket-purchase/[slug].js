'use client';
import TradingViewWidget from '@components/TradingViewWidget';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BuyTicketButton from '@components/BuyTicketButton';
import { usePiAuth } from '../../context/PiAuthContext';
import descriptions from '../../data/descriptions';
import GiftTicketModal from '@components/GiftTicketModal';

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
  { question: "What is 2 + 2?", answer: "4" },
  { question: "What is 5 - 3?", answer: "2" },
  { question: "What is 10 ÷ 2?", answer: "5" },
  { question: "What is 3 x 3?", answer: "9" },
  { question: "What is 7 + 1?", answer: "8" },
  { question: "What is 6 - 4?", answer: "2" },
  { question: "What is 9 - 6?", answer: "3" },
  { question: "What is 4 x 2?", answer: "8" },
  { question: "What is 12 ÷ 4?", answer: "3" },
  { question: "What is 1 + 1?", answer: "2" },
  { question: "What is 8 ÷ 2?", answer: "4" },
  { question: "What is 6 + 3?", answer: "9" },
  { question: "What is 15 - 5?", answer: "10" },
  { question: "What is 0 + 7?", answer: "7" },
  { question: "What is 9 x 1?", answer: "9" },
  { question: "What is 10 - 1?", answer: "9" },
  { question: "What is 3 + 5?", answer: "8" },
  { question: "What is 2 x 6?", answer: "12" },
  { question: "What is 14 ÷ 2?", answer: "7" },
  { question: "What is 7 - 2?", answer: "5" }
];


const DetailRow = ({ label, value, highlight = false }) => (
  <div className="flex justify-between">
    <span className="font-semibold">{label}</span>
    <span className={highlight ? 'text-red-400 font-bold' : ''}>{value}</span>
  </div>
);


export default function TicketPurchasePage() {
  const router = useRouter();
   const slugArray = router.query.slug || []; // could be ['1000-pi-giveaway'] or ['pi', '1000-pi-giveaway']
  const slug = Array.isArray(slugArray) ? slugArray[slugArray.length - 1] : slugArray;

  const { user, login, isAuthenticated } = usePiAuth();
 




  const [comp, setComp] = useState(null);
  const miniImages = comp?.thumbnails || [];

  const isCryptoCompetition = comp?.theme === 'crypto' || comp?.slug?.startsWith('crypto');

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
  const [showGiftModal, setShowGiftModal] = useState(false);

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
  if (!comp?.slug) return;

  const desc = descriptions[comp.slug];

  if (typeof desc === 'string') {
    setDescription(desc);
  } else if (desc?.description) {
    setDescription(desc.description); // ✅ fix here
  } else {
    setDescription('No detailed description available.');
  }
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
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-300"></div>
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
 <main className="min-h-screen px-4 py-4 text-white bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] font-orbitron">
  <div className="max-w-xl mx-auto bg-[#0f172a]/70 backdrop-blur-lg border-2 border-cyan-400 rounded-2xl shadow-[0_0_30px_#00ffd5cc] p-2">
<div className="relative bg-gradient-to-r from-[#00ffd5] to-[#0077ff] rounded-t-xl text-[#0f172a] py-3 px-0 text-center font-bold text-lg sm:text-2xl tracking-wider shadow-[0_4px_20px_#00fff770] uppercase">
  {comp.title}
</div>

      <div className="space-y-6 text-center">

{/* Image and Thumbnails */}
{!isDaily && !isCryptoCompetition && mainImage && (
  <div className="space-y-6 text-center">
    <Image
      src={mainImage}
      alt={comp.title}
      width={600}
      height={300}
      className="w-full max-h-56 object-cover rounded-lg border border-blue-500 mx-auto"
    />
    
    {miniImages?.length > 0 && (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 px-2 place-items-center">
        {miniImages.map((img, i) => (
          <div
            key={i}
            className="relative w-20 h-16 sm:w-28 sm:h-20 rounded-lg border border-cyan-400 overflow-hidden"
          >
            <Image
              src={img}
              alt={`Thumbnail ${i + 1}`}
              fill
              className="object-fit"
              sizes="(max-width: 640px) 96px, 112px"
            />
          </div>
        ))}
      </div>
    )}
  </div>
)}
        {/* Crypto Widget */}
        {isCryptoCompetition && (
          <div className="w-full h-[400px] my-4">
            <TradingViewWidget />
          </div>
        )}
 {competitionStatus === 'active' && (
   <div className="text-lg font-bold text-black bg-gradient-to-r from-green-500 to-green-700 px-6 py-2 rounded-full shadow-lg animate-pulse tracking-wide uppercase">
  Live Now
</div>

  )}
{/* Prize and LIVE banner below */}
<div className="text-center space-y-3">
  <p className="text-cyan-300 text-xl font-semibold backdrop-blur-md bg-white/10 border border-cyan-300 rounded-lg px-6 py-2 shadow-md inline-block">
    {comp.prize}
  </p>

 
</div>






        {/* Details Grid */}
        <div className="max-w-md mx-auto text-sm text-white space-y-2">
          <DetailRow label="Starts On" value={comp.startsAt ? new Date(comp.startsAt).toLocaleDateString('en-GB') : 'TBA'} />
          <DetailRow label="Draw Takes Place" value={comp.endsAt ? new Date(comp.endsAt).toLocaleDateString('en-GB') : 'TBA'} />
          <DetailRow label="Entry Fee" value={`${comp.entryFee.toFixed(2)} π`} />

<DetailRow
  label="Total Tickets"
  value={`${comp.totalTickets?.toLocaleString() || 'N/A'}`}
/>




          <DetailRow 
            label="Tickets Sold" 
            value={`${liveTicketsSold} / ${comp.totalTickets}${liveTicketsSold >= comp.totalTickets ? ' (SOLD OUT)' : ''}`}
            highlight={liveTicketsSold >= comp.totalTickets}
          />
          {liveTicketsSold > 0 && (
            <DetailRow 
              label="Available" 
              value={`${Math.max(0, comp.totalTickets - liveTicketsSold)} tickets remaining`} 
              highlight
            />
            
          )}
                    <DetailRow label="Max Ticket Purchases" value={comp.maxTicketsPerUser?.toLocaleString() || '10'} />

        </div>



        {/* Free or Paid Entry */}
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
              <div className="text-sm bg-cyan-500 p-3 rounded-lg font-semibold">
                Please{' '}
                <button onClick={login} className="text-white">
                  log in
                </button>{' '}
                with Pi to buy tickets.
              </div>
            )}

             <p className="text-lg text font-bold mt-6">Total  {totalPrice.toFixed(2)} π</p>
            {/* Ticket Quantity Selector */}
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

            {/* Warnings */}
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

           
           

          {!showSkillQuestion ? (
  <>
    <button
      onClick={handleShowSkillQuestion}
      className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-3 px-4 rounded-xl mt-6"
    >
      Proceed to Payment
    </button>
     {/* Payment Summary */}
            <p className="text-cyan-300 text-sm mt-2">
              Secure your entry to {comp.prize}<br />
              Thank you for participating and good luck
            </p>

    {user?.username && (
      <button
        onClick={(e) => {
          e.preventDefault();
          setShowGiftModal(true);
        }}
        className="w-full mt-6 py-3 px-4 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 transition"

      >
        🎁 Gift a Ticket
      </button>
    )}
  </>
) : (

         <div className="mt-6 max-w-md mx-auto text-center">
  <label htmlFor="skill-question" className="block font-semibold mb-1 text-white">
    Skill Question (Required to Enter):
  </label>
  <p className="mb-2">{selectedQuestion?.question}</p>
  <input
    id="skill-question"
    type="text"
    className="w-full px-4 py-2 rounded-lg bg-[#0f172a]/60 border border-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
    value={skillAnswer}
    onChange={(e) => setSkillAnswer(e.target.value)}
    placeholder="Enter your answer"
    style={{ maxWidth: '300px' }}
  />
  
  {/* Show warning if answer is wrong */}
  {!isAnswerCorrect() && skillAnswer !== '' && (
    <p className="text-sm text-red-400 mt-1">
      You must answer correctly to proceed.
    </p>
  )}

  {/* Show Buy Ticket Button if answer is correct */}
  {isAnswerCorrect() && (
    <>
      <BuyTicketButton
        competitionSlug={slug}
        entryFee={comp.entryFee}
        quantity={quantity}
        piUser={user}
        onPaymentSuccess={handlePaymentSuccess}
        endsAt={comp.endsAt}
      />

    </>
  )}
</div>

            )}
          </>
        )}
  <GiftTicketModal
  isOpen={showGiftModal}
  onClose={() => setShowGiftModal(false)}
  preselectedCompetition={comp}
/>
        {/* View More Details Toggle - below details */}
<div className="mt-4 text-center">
  <button
    onClick={() => setShowDetails(!showDetails)}
    className="text-sm text-cyan-300 hover:text-cyan-300 transition"
  >
    {showDetails ? 'Hide' : 'View'} Competition Details
  </button>
</div>

{showDetails && (
  <div className="mt-2 bg-white/10 p-4 rounded-lg border border-cyan-400 text-sm whitespace-pre-wrap leading-relaxed">
    <h2 className="text-center text-lg font-bold mb-2 text-cyan-300">Competition Details</h2>
    <p>{description}</p>
  </div>
)}
        {/* Footer Links */}
        <div className="mt-6 text-xs text-cyan-300 flex flex-col items-center space-y-2">
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