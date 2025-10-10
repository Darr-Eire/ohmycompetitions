// src/components/EnhancedGiftTicketModal.jsx
'use client';

import { useState, useEffect } from 'react';
import { usePiAuth } from '../context/PiAuthContext';
import { useToast } from '../context/ToastContext';
import { getRandomQuestion } from '../data/skill-questions';

export default function EnhancedGiftTicketModal({ isOpen, onClose, preselectedCompetition = null }) {
  const { user } = usePiAuth();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(preselectedCompetition || '');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skillQuestion, setSkillQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [questionAnswered, setQuestionAnswered] = useState(false);

  // Load competitions
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch('/api/competitions');
        if (response.ok) {
          const data = await response.json();
          setCompetitions(data.competitions || []);
        }
      } catch (error) {
        console.error('Error fetching competitions:', error);
      }
    };

    if (isOpen) {
      fetchCompetitions();
    }
  }, [isOpen]);

  // Generate skill question when competition is selected
  useEffect(() => {
    if (selectedCompetition && !questionAnswered) {
      const question = getRandomQuestion();
      setSkillQuestion(question);
      setUserAnswer('');
    }
  }, [selectedCompetition, questionAnswered]);

  const validateRecipient = async (username) => {
    try {
      const response = await fetch(`/api/user/validate?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      return { valid: response.ok, error: data.message };
    } catch {
      return { valid: false, error: 'Failed to validate recipient' };
    }
  };

  const handleAnswerQuestion = () => {
    if (!skillQuestion || !userAnswer.trim()) return;

    const isCorrect = skillQuestion.answers.some(answer => 
      answer.toLowerCase() === userAnswer.toLowerCase()
    );

    if (isCorrect) {
      setQuestionAnswered(true);
      showSuccess('Correct answer! You can now proceed with gifting.');
    } else {
      showError('Incorrect answer. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.username) {
      showError('Please log in to gift tickets');
      return;
    }

    if (!selectedCompetition || !recipientUsername || !quantity) {
      showError('Please fill in all fields');
      return;
    }

    if (!questionAnswered) {
      showError('Please answer the skill question first');
      return;
    }

    setLoading(true);
    showInfo('Processing gift...');

    try {
      const recipientCheck = await validateRecipient(recipientUsername.trim());
      if (!recipientCheck.valid) {
        showError(recipientCheck.error);
        setLoading(false);
        return;
      }

      const selectedComp = competitions.find(c => c._id === selectedCompetition);
      if (!selectedComp) {
        showError('Selected competition not found.');
        setLoading(false);
        return;
      }
      
      const entryFee = selectedComp?.comp?.entryFee || 0;
      const amountToPay = quantity * entryFee;

      // Create payment with Pi
      window.Pi.createPayment({
        amount: amountToPay,
        memo: `Gifting ${quantity} ticket(s) to ${recipientUsername} for ${selectedComp.title}`,
        metadata: {
          type: 'gift',
          from: user.username,
          to: recipientUsername,
          competitionSlug: selectedComp.comp?.slug,
          quantity,
        },
      }, {
        onReadyForServerApproval: (paymentId) => {
          console.log('Payment ID ready:', paymentId);
        },
        onReadyForServerCompletion: async (paymentId, txId) => {
          try {
            const res = await fetch('/api/tickets/gift-with-skill', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fromUsername: user.username,
                toUsername: recipientUsername.trim(),
                competitionId: selectedCompetition,
                quantity: parseInt(quantity),
                paymentId,
                transaction: { identifier: paymentId },
                skillQuestionData: skillQuestion,
                userAnswer: userAnswer
              })
            });

            const result = await res.json();
            if (res.ok && result.success) {
              showSuccess(`🎁 Successfully gifted ${quantity} ticket(s) to ${recipientUsername}!`);
              setRecipientUsername('');
              setQuantity(1);
              setSelectedCompetition('');
              setQuestionAnswered(false);
              setSkillQuestion(null);
              setUserAnswer('');
              setTimeout(() => { onClose(); }, 2000);
            } else {
              showError(result.message || 'Failed to send gift');
            }
          } catch (error) {
            console.error('Gift error:', error);
            showError('Failed to process gift');
          }
          setLoading(false);
        },
        onCancel: () => {
          setLoading(false);
          showInfo('Payment cancelled');
        },
        onError: (err) => {
          console.error('Payment error:', err);
          setLoading(false);
          showError('Payment error: ' + err.message);
        }
      });
    } catch (error) {
      console.error('Gift error:', error);
      setLoading(false);
      showError('Failed to process gift');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f172a] border border-cyan-400 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cyan-300">🎁 Gift Tickets</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Competition Selection */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Competition</label>
            <select
              value={selectedCompetition}
              onChange={(e) => {
                setSelectedCompetition(e.target.value);
                setQuestionAnswered(false);
              }}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
              required
            >
              <option value="">Select a competition</option>
              {competitions.map(comp => (
                <option key={comp._id} value={comp._id}>
                  {comp.title} - {comp.comp?.entryFee || 0} π
                </option>
              ))}
            </select>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Recipient Username</label>
            <input
              type="text"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
              required
            />
          </div>

          {/* Skill Question */}
          {selectedCompetition && skillQuestion && !questionAnswered && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-400/30">
              <h3 className="text-sm font-semibold text-yellow-300 mb-2">Skill Question</h3>
              <p className="text-white text-sm mb-3">{skillQuestion.question}</p>
              <div className="space-y-2">
                {skillQuestion.answers.map((answer, index) => (
                  <div key={index} className="text-xs text-gray-400">
                    {answer}
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Your answer..."
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 text-sm"
                />
                <button
                  type="button"
                  onClick={handleAnswerQuestion}
                  className="mt-2 w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded text-sm"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          )}


          {/* Submit Button */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !questionAnswered}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-semibold py-2 px-4 rounded"
            >
              {loading ? 'Processing...' : 'Gift Tickets'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
