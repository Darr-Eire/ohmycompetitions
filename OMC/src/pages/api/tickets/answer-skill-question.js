// src/pages/api/tickets/answer-skill-question.js
import { dbConnect } from '../../../lib/dbConnect';
import Ticket from '../../../models/Ticket';
import { isCorrectAnswer } from '../../../data/skill-questions';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { ticketId, userAnswer } = req.body;

    if (!ticketId || !userAnswer) {
      return res.status(400).json({ 
        message: 'Missing required fields: ticketId, userAnswer' 
      });
    }

    // Find the ticket
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if question has already been answered
    if (ticket.skillQuestion.userAnswer) {
      return res.status(400).json({ 
        message: 'Question already answered',
        isCorrect: ticket.skillQuestion.isCorrect,
        userAnswer: ticket.skillQuestion.userAnswer,
        correctAnswer: ticket.skillQuestion.correctAnswer
      });
    }

    // Check if the answer is correct
    const questionObj = {
      id: ticket.skillQuestion.questionId,
      question: ticket.skillQuestion.question,
      answers: ticket.skillQuestion.answers
    };
    
    const isCorrect = isCorrectAnswer(questionObj, userAnswer);

    // Update the ticket with the user's answer
    ticket.skillQuestion.userAnswer = userAnswer;
    ticket.skillQuestion.isCorrect = isCorrect;
    ticket.skillQuestion.attemptedAt = new Date();

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Answer recorded successfully',
      isCorrect,
      userAnswer,
      correctAnswer: ticket.skillQuestion.correctAnswer,
      question: ticket.skillQuestion.question,
      ticketId: ticket._id
    });

  } catch (error) {
    console.error('Error answering skill question:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

