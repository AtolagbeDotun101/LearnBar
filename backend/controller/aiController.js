import Document from "../model/Document.js";
import Flashcard from "../model/Flashcard.js";
import Quiz from "../model/Quiz.js";
import ChatHistory from "../model/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";


// @desc Generate flashcards using AI for a document
// @route POST /api/ai/generate-flashcards
// @access Private
export const generateFlashcards = async (req, res, next) => {
    try{
        const { documentId, count = 10 } = req.params;

        if(!documentId){
            return res.status(400).json({
                message: "Document ID is required",
                success: false,
                status: "failed",
            }); 
        }

        if(!mongoose.Types.ObjectId.isValid(documentId)){
            return res.status(400).json({
                message: "Invalid document ID",
                success: false,
                status: "failed",
            });
        }

        const document = await Document.findOne({_id: documentId,
             userId: req.user._id,
              status: "ready",
              processed: true,
            });
        if(!document){
            return res.status(404).json({
                message: "Document not found or not processed",
                success: false,
                status: "failed",
            });
        }

        const flashcards = await geminiService.generateFlashcards(document.extractedText, parseInt(count));
        const flashcardData = flashcards.map(card => ({
            question: card.question,
            answer: card.answer,
            difficulty: card.difficulty,
            reviewCount: 0,
            isStarred: false,
        }));

        const flashcard = new Flashcard({
            userId: req.user._id,
            documentId: document._id,
            cards: flashcardData,
        });
        await flashcard.save();
        res.status(200).json({
            message: "Flashcards generated successfully",
            success: true,
            data: flashcard,
            count: flashcardData.length,
        });
    } catch (error) {
        next(error);
    }
};

// @desc Generate quiz using AI for a document
// @route POST /api/ai/generate-quiz
// @access Private
export const generateQuiz = async (req, res, next) => {
    try{
        const { documentId, numQuestions = 10, title } = req.body;
        if(!documentId || !title){
            return res.status(400).json({
                message: "Document ID and title are required",
                success: false,
                status: "failed",
            });
        }
        if(!mongoose.Types.ObjectId.isValid(documentId)){
            return res.status(400).json({
                message: "Invalid document ID",
                success: false,
                status: "failed",
            });
        }
        const document = await Document.findOne({
            _id: documentId,
             userId: req.user._id,
              status: "ready"
            });

        if(!document){
            return res.status(404).json({
                message: "Document not found or not ready",
                success: false,
                statusCode: 404,
            });
        }
        const questions = await geminiService.generateQuiz(document.extractedText, parseInt(numQuestions));
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            description: description,
            questions: questions,
            score: 0,
        });
        res.status(201).json({
            message: "Quiz generated successfully",
            success: true,
            data: quiz,
        });
    }catch(error){
        next(error);
    }
};

// @desc Generate summary using AI for a document
// @route POST /api/ai/generate-summary
// @access Private
export const generateSummary = async (req, res, next) => {
    try{
        const {documentId} = req.body;
        if(!documentId){
            return res.status(400).json({
                message: "Document ID is required",
                success: false,
                status: "failed",
            });
        }
        if(!mongoose.Types.ObjectId.isValid(documentId)){
            return res.status(400).json({
                message: "Invalid document ID",
                success: false,
                status: "failed",
            });
        }
        const document = await Document.findOne({_id: documentId, userId: req.user._id, status: "ready"});
        if(!document){
            return res.status(404).json({
                message: "Document not found or not ready",
                success: false,
                statusCode: 404,
            });
        }
        const summary = await geminiService.generateSummary(document.extractedText);
        
        res.status(200).json({
            message: "Summary generated successfully",
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary: summary,
            },
        });
    }catch(error){
        next(error);
    }
};

// @desc Generate chat history for a document
// @route POST /api/ai/chat
// @access Private
export const chat = async (req, res, next) => {
    try{
        const {documentId, question} = req.body;
        if(!documentId || !question){
            return res.status(400).json({
                message: "Document ID and question are required",
                success: false,
                status: "failed",
            });
        }
        if(!mongoose.Types.ObjectId.isValid(documentId)){
            return res.status(400).json({
                message: "Invalid document ID",
                success: false,
                status: "failed",
            });
        }
        const document = await Document.findOne({_id: documentId, userId: req.user._id, status: "ready"});
        if(!document){
            return res.status(404).json({
                message: "Document not found or not ready",
                success: false,
                statusCode: 404,
            });
        }
        
        const relevantChunks = await findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(chunk => chunk.chunkIndex);

        //Get or create chat history
        let chatHistory = await ChatHistory.findOne({documentId: document._id, userId: req.user._id});
        if(!chatHistory){
            chatHistory = new ChatHistory({
                userId: req.user._id,
                documentId: document._id,
                messages: [],
            });
            await chatHistory.save();
        }

        //generate response
        const response = await geminiService.chatWithContext(question, relevantChunks);
        chatHistory.messages.push({
            role: "user",
            content: question,
            relevantChunks: [],
            timestamp: new Date(),
        },    
        {
            role: "assistant",
            content: response,
            relevantChunks: chunkIndices,
            timestamp: new Date(),
        });
        await chatHistory.save();
        res.status(200).json({
            message: "Chat generated successfully",
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                response: response,
            },
        });
    }catch(error){
        next(error);
    }
};

// @desc Explain a concept using AI
// @route POST /api/ai/explain-concept
// @access Private
export const explainCOncept = async (req, res, next) => {
    try{
        const  {documentId, concept} = req.body;
        if(!documentId || !concept){
            return res.status(400).json({
                message: "Document ID and concept are required",
                success: false,
                status: "failed",
            });
        }
        if(!mongoose.Types.ObjectId.isValid(documentId)){
            return res.status(400).json({
                message: "Invalid document ID",
                success: false,
                status: "failed",
            });
        }
        const document = await Document.findOne({_id: documentId, userId: req.user._id, status: "ready", processed: true});
        if(!document){
            return res.status(404).json({
                message: "Document not found or not processed",
                success: false,
                statusCode: 404,
            });
        }
        const relevantChunks = await findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(chunk => chunk.content).join('\n\n');

        //generate response
        const explanation = await geminiService.explainConcept(concept, context);

        res.status(200).json({
            message: "Explanation generated successfully",
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                concept,
                explanation,
                relevantChunks: relevantChunks.map(chunk => chunk.chunkIndex),
            },
        });
    }catch(error){
        next(error);
    }
};

// @desc Get chat history for a document
// @route GET /api/ai/chat-history/:documentId
// @access Private
export const getChatHistory = async (req, res, next) => {
    try{
        const {documentId} = req.params;
        if(!documentId){
            return res.status(400).json({
                message: "Document ID is required",
                success: false,
                status: "failed",
            });
        }
        if(!mongoose.Types.ObjectId.isValid(documentId)){
            return res.status(400).json({
                message: "Invalid document ID",
                success: false,
                status: "failed",
            });
        }
        const document = await Document.findOne({_id: documentId, userId: req.user._id, status: "ready"});
        if(!document){
            return res.status(404).json({
                message: "Document not found or not ready",
                success: false,
                statusCode: 404,
            });
        }
        const chatHistory = await ChatHistory.findOne(
            {documentId: document._id,
                 userId: req.user._id
                }).select('messages');
        if(!chatHistory){
            return res.status(200).json({
                message: "Chat history not found",
                success: true,
                data: [],
            });
        }
        res.status(200).json({
            message: "Chat history retrieved successfully",
            success: true,
            data: chatHistory.messages,
        });
    }catch(error){
        next(error);
    }
};  