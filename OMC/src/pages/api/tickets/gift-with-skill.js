// src/pages/api/tickets/gift-with-skill.js
import { dbConnect } from '../../../lib/dbConnect';
import Ticket from '../../../models/Ticket';
import User from '../../../models/User';
import Competition from '../../../models/Competition';
import { getRandomQuestion, isCorrectAnswer } from '../../../data/skill-questions';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      fromUsername,
      toUsername,
      competitionSlug,
      competitionId,
      quantity = 1,
      skillQuestionData,
      userAnswer
    } = req.body || {};

    if (!fromUsername || !toUsername || (!competitionSlug && !competitionId)) {
      return res.status(400).json({ 
        message: 'Missing required fields: fromUsername, toUsername, competitionSlug or competitionId' 
      });
    }

    if (fromUsername.toLowerCase() === toUsername.toLowerCase()) {
      return res.status(400).json({ 
        message: 'You cannot gift a ticket to yourself' 
      });
    }

    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ 
        message: 'Quantity must be between 1 and 10' 
      });
    }

    // Find users
    const sender = await User.findOne({
      username: { $regex: new RegExp(`^${fromUsername}$`, 'i') }
    });
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    const recipient = await User.findOne({
      username: { $regex: new RegExp(`^${toUsername}$`, 'i') }
    });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Find competition
    let competition;
    if (competitionId) {
      competition = await Competition.findById(competitionId);
    } else {
      competition = await Competition.findOne({ 'comp.slug': competitionSlug });
    }
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    if (competition.comp?.status !== 'active') {
      return res.status(400).json({ message: 'Competition is not active' });
    }

    // Validate skill question answer if provided
    if (skillQuestionData && userAnswer) {
      const questionObj = {
        id: skillQuestionData.questionId,
        question: skillQuestionData.question,
        answers: skillQuestionData.answers
      };
      
      const isCorrect = isCorrectAnswer(questionObj, userAnswer);
      if (!isCorrect) {
        return res.status(400).json({ 
          message: 'Incorrect answer to skill question' 
        });
      }
    }

    // Generate skill question if not provided
    let questionData = skillQuestionData;
    if (!questionData) {
      const randomQuestion = getRandomQuestion();
      questionData = {
        questionId: randomQuestion.id,
        question: randomQuestion.question,
        answers: randomQuestion.answers,
        correctAnswer: randomQuestion.answers[0],
        userAnswer: userAnswer || '',
        isCorrect: userAnswer ? isCorrectAnswer(randomQuestion, userAnswer) : false,
        difficulty: randomQuestion.difficulty,
        tags: randomQuestion.tags
      };
    }

    // Create tickets with skill question data
    const tickets = [];
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        for (let i = 0; i < quantity; i++) {
          const ticket = new Ticket({
            username: recipient.username,
            competitionSlug: competition.comp.slug,
            competitionId: competition._id,
            competitionTitle: competition.title,
            imageUrl: competition.imageUrl,
            quantity: 1,
            ticketNumbers: [`GIFT-${Date.now()}-${i + 1}`],
            purchasedAt: new Date(),
            gifted: true,
            giftedBy: sender.username,
            skillQuestion: {
              ...questionData,
              attemptedAt: new Date()
            }
          });

          await ticket.save({ session });
          tickets.push(ticket);
        }
      });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }

    res.status(201).json({
      success: true,
      message: `Successfully gifted ${quantity} ticket(s) to ${recipient.username}`,
      tickets: tickets.map(ticket => ({
        id: ticket._id,
        ticketNumbers: ticket.ticketNumbers,
        competitionTitle: ticket.competitionTitle,
        skillQuestion: ticket.skillQuestion
      })),
      recipient: {
        username: recipient.username,
        id: recipient._id
      },
      sender: {
        username: sender.username,
        id: sender._id
      }
    });

  } catch (error) {
    console.error('Error gifting tickets with skill question:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

