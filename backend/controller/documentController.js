import Document from "../model/Document.js";
import Flashcard from "../model/Flashcard.js";
import Quiz from "../model/Quiz.js";
import {extractTextFromPDF} from "../utils/pdfParser.js";
import {chunkText} from "../utils/textChunker.js";
import mongoose from "mongoose";
import fs from "fs";

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        const { title } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded',
                 success: false,
                 statusCode: 400
                });
        }
        if (!title || title.trim().length === 0) {
            await fs.unlink(file.path);
            return res.status(400).json({
                 message: 'Title is required',
                 success: false,
                  statusCode: 400 
                });
        }

        //url to access the file can be constructed based on your server setup
        const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
        const fileUrl = `${baseUrl}/uploads/${file.filename}`;

        const document = new Document({
            userId: req.user._id,
            title: title.trim(),
            filePath: file.path,
            fileUrl,
            fileType: file.mimetype,
        });
        //process PDF file, in prod use queue or background job
        proccessPDF(document._id, file.path).catch((err) => {
            console.error("Error processing PDF:", err);
        });

        
        res.status(201).json({
            message: 'Document uploaded successfully Processing in background',
            success: true,
            data: document,
        });
    
    } catch (error) {
        if (req.file) {
            //delete the uploaded file in case of error
            await fs.unlink(req.file.path);
        }
        next(error);
    }
};

//helper function to process PDF and chunk text
const proccessPDF = async (documentId, filePath) => {
    try {
        const {text} = await extractTextFromPDF(filePath);

        // create text chunks
        const chunks = chunkText(text, 500, 50);

        //update document with chunks
        await Document.findByIdAndUpdate(documentId, {
            textChunks: chunks,
            processed: true,
            status: 'ready',
        }); 

        console.log( `Document : ${documentId} proccessed successfully with ${chunks.length} chunks.`);

    } catch (error) {
        console.error("Error in proccessPDF:", error);
        await Document.findByIdAndUpdate(documentId, {
            processed: false,
            status: 'failed',
        }); 
    }
}

//@desc    Get user's documents 
//@route   GET /api/documents
//@access  Private
export const getDocuments = async (req, res, next) => { 
    try {
        const documents = await Document.aggregate([
            {
                match: { userId: mongoose.Types.ObjectId(req.user._id) }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcards'
                }
            },
            {
                $lookup:{
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }

            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcards' },
                    quizCount: { $size: '$quizzes' }
                }
            },
            { $project: {
                    flashcards: 0,
                    quizzes: 0,
                    extractTextFromPDF: 0,
                    chunks: 0
                }
            },
            {
                $sort: { uploadDate: -1 }
            }
        ])
        res.status(200).json({
            message: 'Documents fetched successfully',
            success: true,
            data: documents,
            count: documents.length
        });
    } catch (error) {
        next(error);  
    }
}

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
    try {
        const documentId = req.params.id;

        // Find the document
        const document = await Document.findOne({ _id: documentId, userId: req.user._id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found', success: false });
        }

        // Delete associated flashcards and quizzes
        await Flashcard.deleteMany({ documentId: document._id });
        await Quiz.deleteMany({ documentId: document._id });

        // Delete the document file from storage
        fs.unlinkSync(document.filePath);

        // Delete the document from the database
        await document.deleteOne();

        res.status(200).json({ message: 'Document deleted successfully', success: true });
    } catch (error) {
        next(error);    
    }
};

// @desc    Get document details
// @route   GET /api/documents/:id
// @access  Private
export const getDocumentById = async (req, res, next) => {
    try {
        const documentId = req.params.id;

        // Find the document
        const document = await Document.findOne({ _id: documentId, userId: req.user._id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found', success: false });
        }

        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id });
        document.lastAccessed = new Date();
        await document.save(); 


        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            message: 'Document details fetched successfully',
            success: true,
            data: documentData,
        });
    } catch (error) {
        next(error);    
    }
};

// @desc update document title
// @route PUT /api/documents/:id
// @access Private
export const updateDocument = async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error);
    }
};