// src/components/TicketSkillQuestion.jsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function TicketSkillQuestion({ ticketId, showAnswer = false }) {
  const { t } = useTranslation();
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/tickets/skill-question?ticketId=${ticketId}`);
        const data = await response.json();
        
        if (response.ok) {
          setQuestionData(data.data);
          setAnswered(!!data.data.answer);
          if (data.data.answer) {
            setUserAnswer(data.data.answer.userAnswer);
          }
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(t('failed_to_load_skill_question', 'Failed to load skill question'));
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [ticketId]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/tickets/answer-skill-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, userAnswer: userAnswer.trim() })
      });

      const data = await response.json();
      if (response.ok) {
        setAnswered(true);
        setQuestionData(prev => ({
          ...prev,
          answer: {
            userAnswer: data.userAnswer,
            isCorrect: data.isCorrect,
            correctAnswer: data.correctAnswer
          }
        }));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(t('failed_to_submit_answer', 'Failed to submit answer'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4">
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    );
  }

  if (!questionData) {
    return null;
  }

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">{t('skill_question', 'Skill Question')}</h4>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${
            questionData.question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
            questionData.question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {questionData.question.difficulty}
          </span>
          {answered && (
            <span className={`px-2 py-1 rounded text-xs ${
              questionData.answer.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {questionData.answer.isCorrect ? t('correct', 'Correct') : t('incorrect', 'Incorrect')}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-gray-300 text-sm">{questionData.question.question}</p>
        
        {!answered ? (
          <form onSubmit={handleSubmitAnswer} className="space-y-3">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={t('your_answer', 'Your answer...')}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 text-sm"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={!userAnswer.trim() || submitting}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-semibold py-2 px-4 rounded text-sm"
            >
              {submitting ? t('submitting', 'Submitting...') : t('submit_answer', 'Submit Answer')}
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('your_answer', 'Your answer')}:</span>
              <span className="text-white">{questionData.answer.userAnswer}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('correct_answer', 'Correct answer')}:</span>
              <span className="text-white">{questionData.answer.correctAnswer}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{t('result', 'Result')}:</span>
              <span className={`font-semibold ${
                questionData.answer.isCorrect ? 'text-green-400' : 'text-red-400'
              }`}>
                {questionData.answer.isCorrect ? `${t('correct', 'Correct')} ✓` : `${t('incorrect', 'Incorrect')} ✗`}
              </span>
            </div>
          </div>
        )}

        {showAnswer && (
          <div className="pt-3 border-t border-gray-600">
            <div className="text-xs text-gray-400 space-y-1">
              <div>{t('question_id', 'Question ID')}: {questionData.question.id}</div>
              <div>{t('ticket_id', 'Ticket ID')}: {questionData.ticketId}</div>
              <div>{t('competition', 'Competition')}: {questionData.competitionTitle}</div>
              <div>{t('answered', 'Answered')}: {new Date(questionData.question.attemptedAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

