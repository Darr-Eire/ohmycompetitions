// src/pages/api/tickets/skill-question.js
import { dbConnect } from '../../../lib/dbConnect';
import Ticket from '../../../models/Ticket';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { ticketId } = req.query;

    if (!ticketId) {
      return res.status(400).json({ 
        message: 'Missing required parameter: ticketId' 
      });
    }

    // Find the ticket
    const ticket = await Ticket.findById(ticketId).select('skillQuestion ticketNumbers competitionTitle competitionSlug');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Return skill question data (without revealing the correct answer if not answered)
    const skillQuestion = ticket.skillQuestion;
    const response = {
      ticketId: ticket._id,
      ticketNumbers: ticket.ticketNumbers,
      competitionTitle: ticket.competitionTitle,
      competitionSlug: ticket.competitionSlug,
      question: {
        id: skillQuestion.questionId,
        question: skillQuestion.question,
        answers: skillQuestion.answers,
        difficulty: skillQuestion.difficulty,
        tags: skillQuestion.tags,
        attemptedAt: skillQuestion.attemptedAt
      }
    };

    // Only include answer data if the question has been answered
    if (skillQuestion.userAnswer) {
      response.answer = {
        userAnswer: skillQuestion.userAnswer,
        isCorrect: skillQuestion.isCorrect,
        correctAnswer: skillQuestion.correctAnswer
      };
    }

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching skill question:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

