import express from 'express';
import {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainCOncept,
    getChatHistory
} from '../controller/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

//all routes are protected
router.use(protect);

/**
 * @swagger
 * /api/ai/generate-flashcards:
 *   post:
 *     summary: Generate flashcards from document content
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *             properties:
 *               documentId:
 *                 type: string
 *                 description: ID of the document to generate flashcards from
 *     responses:
 *       200:
 *         description: Flashcards generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   question:
 *                     type: string
 *                   answer:
 *                     type: string
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/generate-flashcards', generateFlashcards);

/**
 * @swagger
 * /api/ai/generate-quiz:
 *   post:
 *     summary: Generate quiz from document content
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *             properties:
 *               documentId:
 *                 type: string
 *                 description: ID of the document to generate quiz from
 *     responses:
 *       200:
 *         description: Quiz generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/generate-quiz', generateQuiz);

/**
 * @swagger
 * /api/ai/generate-summary:
 *   post:
 *     summary: Generate summary from document content
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *             properties:
 *               documentId:
 *                 type: string
 *                 description: ID of the document to generate summary from
 *     responses:
 *       200:
 *         description: Summary generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/generate-summary', generateSummary);

/**
 * @swagger
 * /api/ai/chat:
 *   post:
 *     summary: Chat with AI about document content
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *               - message
 *             properties:
 *               documentId:
 *                 type: string
 *                 description: ID of the document to chat about
 *               message:
 *                 type: string
 *                 description: User's message
 *     responses:
 *       200:
 *         description: Chat response generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/chat', chat);

/**
 * @swagger
 * /api/ai/explain-concept:
 *   post:
 *     summary: Explain a concept from document content
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documentId
 *               - concept
 *             properties:
 *               documentId:
 *                 type: string
 *                 description: ID of the document containing the concept
 *               concept:
 *                 type: string
 *                 description: Concept to explain
 *     responses:
 *       200:
 *         description: Concept explained successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 explanation:
 *                   type: string
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/explain-concept', explainCOncept);

/**
 * @swagger
 * /api/ai/chat-history/{documentId}:
 *   get:
 *     summary: Get chat history for a document
 *     tags: [AI]
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
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userMessage:
 *                     type: string
 *                   aiResponse:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/chat-history/:documentId', getChatHistory);

export default router;