import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { usePiAuth } from '../../../context/PiAuthContext';

const piCompetitions = {
  'pi-giveaway-10k': {
    title: '10,000 Pi Giveaway',
    prize: '10,000 π',
    piAmount: 2.2,
    date: 'June 28, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-06-30T00:00:00Z',
    location: 'Online',
    totalTickets: 5200,
    ticketsSold: 0,
  },
  'pi-giveaway-5k': {
    title: '5,000 Pi Giveaway',
    prize: '5,000 π',
    piAmount: 1.8,
    date: 'June 29, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-06-30T00:00:00Z',
    location: 'Online',
    totalTickets: 2900,
    ticketsSold: 0,
  },
  'pi-giveaway-2.5k': {
    title: '2,500 Pi Giveaway',
    prize: '2,500 π',
    piAmount: 1.6,
    date: 'June 28, 2025',
    time: '12:00 AM UTC',
    endsAt: '2025-06-29T00:00:00Z',
    location: 'Online',
    totalTickets: 1600,
    ticketsSold: 0,
  },
};

export default function PiTicketPage() {
  const router = useRouter();
  const { slug } = router.query;
  const competition = piCompetitions[slug];
  const { user, loginWithPi } = usePiAuth();

  const [quantity, setQuantity] = useState(1);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!competition) return;

    const updateTimer = () => {
      const diff = new Date(competition.endsAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [competition]);

  const handlePayment = async () => {
    if (!competition) return;

    if (!user) {
      alert('Please login with Pi to enter the competition');
      loginWithPi();
      return;
    }

    const total = competition.piAmount * quantity;

    if (total <= 0) {
      alert('Invalid ticket quantity or price.');
      return;
    }

    if (
      timeLeft.days === 0 &&
      timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0
    ) {
      alert('This competition has ended.');
      return;
    }

    setProcessing(true);

    try {
      if (!window?.Pi?.createPayment) {
        alert('⚠️ Pi SDK not ready');
        setProcessing(false);
        return;
      }

      if (!window.Pi.currentUser?.accessToken) {
        console.log('🔄 Re-authenticating to ensure payment scope...');
        await loginWithPi();
      }

      // Check for incomplete payments first
      try {
        const incompletePayment = await window.Pi.getIncompletePayment();
        if (incompletePayment) {
          console.log('🔄 Found incomplete payment, handling first:', incompletePayment);
          await fetch('/api/pi/incomplete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              payment: incompletePayment,
              slug: incompletePayment.metadata?.competitionSlug || slug 
            })
          });
        }
      } catch (err) {
        console.warn('⚠️ Error checking incomplete payments:', err);
        // Continue with new payment even if check fails
      }

      window.Pi.createPayment(
        {
          amount: total.toFixed(8),
          memo: `Entry to ${competition.title}`,
          metadata: {
            type: 'pi-competition-entry',
            competitionSlug: slug,
            quantity,
          }
        },
        {
          onReadyForServerApproval: async (paymentId) => {
            try {
              const res = await fetch('/api/pi/approve-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, slug, amount: total }),
              });

              const data = await res.json();
              
              if (!res.ok) {
                // If it's a 404, show a more specific message
                if (res.status === 404) {
                  throw new Error('Competition not found. Please contact support.');
                }
                // If it's a 400, show the specific error
                if (res.status === 400) {
                  throw new Error(data.error);
                }
                throw new Error(data.error || 'Payment approval failed');
              }

              console.log('✅ Payment approved');
            } catch (err) {
              console.error('Error approving payment:', err);
              // Only show alert if payment wasn't already approved
              if (!err.message?.includes('already approved')) {
                throw err;
              }
            }
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            try {
              const res = await fetch('/api/pi/complete-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid, slug }),
              });

              const data = await res.json();
              
              if (!res.ok) {
                // Handle specific error cases
                if (res.status === 404) {
                  throw new Error('Competition not found. Please contact support.');
                }
                if (data.error?.includes('no longer available')) {
                  throw new Error('This competition is no longer available for entry. Please try another competition.');
                }
                if (data.error?.includes('not active')) {
                  throw new Error('This competition is no longer active. Please try another competition.');
                }
                throw new Error(data.error || 'Payment completion failed');
              }

              console.log('✅ Payment completed:', data);
              
              // Show ticket number in success message if available
              const ticketMsg = data.ticketNumber 
                ? ` Your ticket number is #${data.ticketNumber}.` 
                : '';
              
              // Show if competition is now full
              const statusMsg = data.competitionStatus === 'completed'
                ? ' This competition is now full!'
                : '';
              
              alert(`✅ Entry confirmed!${ticketMsg}${statusMsg} Good luck!`);
              
              // Refresh page if competition status changed
              if (data.competitionStatus === 'completed') {
                window.location.reload();
              }
            } catch (err) {
              console.error('Error completing payment:', err);
              // Check if the error indicates a successful transaction
              if (err.message?.includes('already completed') || 
                  err.message?.includes('already processed')) {
                alert('✅ Entry confirmed! Good luck!');
              } else {
                // Show user-friendly error message
                const errorMsg = err.message?.includes('Please') 
                  ? err.message  // Already user-friendly
                  : `❌ ${err.message || 'Server completion failed.'}`;
                alert(errorMsg);
                
                // Refresh page if competition is no longer available
                if (err.message?.includes('no longer available') || 
                    err.message?.includes('not active')) {
                  window.location.reload();
                }
              }
            } finally {
              setProcessing(false);
            }
          },
          onIncomplete: (payment) => {
            console.warn('⚠️ Incomplete payment:', payment);
            fetch('/api/pi/incomplete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ payment, slug })
            })
            .catch(err => console.error('Failed to log incomplete payment:', err));
            alert('Your previous payment was incomplete. Please try again.');
            setProcessing(false);
          },
          onCancel: () => {
            console.warn('❌ Payment cancelled');
            setProcessing(false);
          },
          onError: (err) => {
            console.error('❌ Payment error:', err);
            alert('❌ Payment failed. See console for details.');
            setProcessing(false);
          }
        }
      );
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      alert('❌ Something went wrong during payment.');
      setProcessing(false);
    }
  };

  if (!slug) return null;
  if (!competition) {
    return (
      <p className="text-white text-center mt-12 font-orbitron">
        Competition not found.
      </p>
    );
  }

  return (
    <div className="bg-[#0b1120] min-h-screen flex flex-col justify-center items-center px-6 py-10 font-orbitron text-white">
      <div className="max-w-md w-full bg-[#0d1424] border border-blue-500 rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-6">
          {competition.title}
        </h1>

        <section className="text-white text-base max-w-md mx-auto text-left space-y-3">
          {[
            ['Prize', competition.prize],
            ['Entry Fee', `${competition.piAmount} π`],
            ['Total Tickets', competition.totalTickets.toLocaleString()],
            ['Tickets Sold', competition.ticketsSold.toLocaleString()],
            ['Location', competition.location],
            ['Date', competition.date],
            ['Time', competition.time],
            ['Time Left', `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="font-semibold">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </section>

        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold disabled:opacity-50 select-none"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="text-xl font-bold min-w-[3rem] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold select-none"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <p className="text-center text-lg font-bold mt-6">
          Total: {(competition.piAmount * quantity).toFixed(2)} π
        </p>

        <button
          onClick={handlePayment}
          disabled={processing}
          className={`w-full mt-6 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg transition-transform ${
            processing ? 'cursor-not-allowed opacity-70' : 'hover:scale-105'
          }`}
        >
          {processing ? 'Processing...' : 'Pay with Pi'}
        </button>

        <p className="mt-4 text-center text-white font-semibold">
          Pioneers, this is your chance to win big and help grow the Pi ecosystem!
        </p>
      </div>
    </div>
  );
}
