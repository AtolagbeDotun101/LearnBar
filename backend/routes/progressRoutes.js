import express from "express"
import {protect} from "../middleware/auth.js"
import {getDashboard} from "../controller/progressController.js"

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/progress/dashboard:
 *   get:
 *     summary: Get user dashboard with progress statistics
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalDocuments:
 *                   type: number
 *                   description: Total number of documents uploaded
 *                 totalFlashcards:
 *                   type: number
 *                   description: Total number of flashcards created
 *                 totalQuizzes:
 *                   type: number
 *                   description: Total number of quizzes taken
 *                 averageQuizScore:
 *                   type: number
 *                   description: Average quiz score percentage
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [document, flashcard, quiz]
 *                       title:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 progressStats:
 *                   type: object
 *                   properties:
 *                     flashcardsReviewed:
 *                       type: number
 *                     quizzesCompleted:
 *                       type: number
 *                     studyStreak:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/dashboard', getDashboard);


export default router;