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
import cors from 'cors'
import errorHandler from "./middleware/errorHandler.js"
import connectDB from './config/db.js'
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';


const app = express()

// Middleware
app.use(cors(
   { origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'], 
        credentials: true
   }

))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// Routes
app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/flashcards', flashcardRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/progress', progressRoutes)

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Error handling middleware
app.use(errorHandler);

//404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route Not Found',
    success: false,
    statusCode: 404
   })
})

// Connect to MongoDB and start the server
connectDB();

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)

})

// Handle unhandled promise rejections

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`)
  // Close server & exit process
  server.close(() => process.exit(1))
});

