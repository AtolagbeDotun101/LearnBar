import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import flashcardRoutes from './routes/flashcardRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import errorHandler from "./middleware/errorHandler.js"
import connectDB from './config/db.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'

// ✅ Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ✅ CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

// Body parser middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ✅ Static files with proper headers for PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'inline')
            res.setHeader('Access-Control-Allow-Origin', '*')
        }
    },
    // Handle URL encoded filenames
    index: false,
    dotfiles: 'ignore'
}))

// ✅ Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/flashcards', flashcardRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/progress', progressRoutes)

// Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ✅ 404 handler (must be before error handler)
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Route Not Found',
        success: false,
        statusCode: 404,
        path: req.originalUrl
    })
})

// ✅ Error handling middleware (must be last)
app.use(errorHandler)

// Connect to MongoDB
connectDB()

// ✅ Store server instance for cleanup
const PORT = process.env.PORT || 8000
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`API Docs: http://localhost:${PORT}/api/docs`)
})

// ✅ Graceful shutdown
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err)
    // Close server & exit process
    server.close(() => {
        console.log('Server closed due to unhandled rejection')
        process.exit(1)
    })
})

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    server.close(() => {
        console.log('HTTP server closed')
        process.exit(0)
    })
})

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server')
    server.close(() => {
        console.log('HTTP server closed')
        process.exit(0)
    })
})

export default app