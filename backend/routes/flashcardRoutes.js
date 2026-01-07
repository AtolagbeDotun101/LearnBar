import express from 'express';
import {

  getUserFlashcards,
  getFlashcardsByDocument,
  reviewFlashcard,
  toggleFavoriteFlashcard,
  deleteFlashcard,
} from '../controller/flashcardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect)

/**
 * @swagger
 * /api/flashcards:
 *   get:
 *     summary: Get all user flashcards
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Flashcards retrieved successfully
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
 *                   question:
 *                     type: string
 *                   answer:
 *                     type: string
 *                   isStarred:
 *                     type: boolean
 *                   reviewCount:
 *                     type: number
 *                   lastReviewed:
 *                     type: string
 *                     format: date-time
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getUserFlashcards);

/**
 * @swagger
 * /api/flashcards/{documentId}:
 *   get:
 *     summary: Get flashcards by document ID
 *     tags: [Flashcards]
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
 *         description: Flashcards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   question:
 *                     type: string
 *                   answer:
 *                     type: string
 *                   isStarred:
 *                     type: boolean
 *                   reviewCount:
 *                     type: number
 *                   lastReviewed:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Document not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:documentId', getFlashcardsByDocument);

/**
 * @swagger
 * /api/flashcards/{cardId}/review:
 *   put:
 *     summary: Review a flashcard
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - difficulty
 *             properties:
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 description: Difficulty level of the review
 *     responses:
 *       200:
 *         description: Flashcard reviewed successfully
 *       404:
 *         description: Flashcard not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:cardId/review', reviewFlashcard);

/**
 * @swagger
 * /api/flashcards/{cardId}/star:
 *   put:
 *     summary: Toggle favorite status of a flashcard
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard ID
 *     responses:
 *       200:
 *         description: Favorite status toggled successfully
 *       404:
 *         description: Flashcard not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:cardId/star', toggleFavoriteFlashcard);

/**
 * @swagger
 * /api/flashcards/{id}:
 *   delete:
 *     summary: Delete a flashcard
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Flashcard ID
 *     responses:
 *       200:
 *         description: Flashcard deleted successfully
 *       404:
 *         description: Flashcard not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteFlashcard);

export default router; 