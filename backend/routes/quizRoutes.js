import express from 'express';
import {
    getQuizById,
    getQuizzes,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controller/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/quizzes/{documentId}:
 *   get:
 *     summary: Get all quizzes for a document
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   documentId:
 *                     type: string
 *                   title:
 *                     type: string
 *                   questions:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         question:
 *                           type: string
 *                         options:
 *                           type: array
 *                           items:
 *                             type: string
 *                         correctAnswer:
 *                           type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:documentId', getQuizzes);

/**
 * @swagger
 * /api/quizzes/quiz/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 documentId:
 *                   type: string
 *                 title:
 *                   type: string
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       question:
 *                         type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: string
 *                       correctAnswer:
 *                         type: number
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/quiz/:id', getQuizById);

/**
 * @swagger
 * /api/quizzes/{id}/submit:
 *   post:
 *     summary: Submit quiz answers
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array of selected answer indices
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 score:
 *                   type: number
 *                 totalQuestions:
 *                   type: number
 *                 percentage:
 *                   type: number
 *                 answers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       questionIndex:
 *                         type: number
 *                       selectedAnswer:
 *                         type: number
 *                       correctAnswer:
 *                         type: number
 *                       isCorrect:
 *                         type: boolean
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:id/submit', submitQuiz);

/**
 * @swagger
 * /api/quizzes/{id}/results:
 *   get:
 *     summary: Get quiz results
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quizId:
 *                   type: string
 *                 score:
 *                   type: number
 *                 totalQuestions:
 *                   type: number
 *                 percentage:
 *                   type: number
 *                 submittedAt:
 *                   type: string
 *                   format: date-time
 *                 answers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       questionIndex:
 *                         type: number
 *                       selectedAnswer:
 *                         type: number
 *                       correctAnswer:
 *                         type: number
 *                       isCorrect:
 *                         type: boolean
 *       404:
 *         description: Quiz results not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/results', getQuizResults);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteQuiz);

export default router;