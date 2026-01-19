import Document from "../model/Document.js";
import Flashcard from "../model/Flashcard.js";
import Quiz from "../model/Quiz.js";
import {extractTextFromPDF} from "../utils/pdfParser.js";
import {chunkText} from "../utils/textChunker.js";
import fs from "fs";
import path from "path"; 

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        const { title } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ 
                message: 'No file uploaded',
                success: false,
                statusCode: 400
            });
        }
        
        if (!title || title.trim().length === 0) {
            try {
                fs.unlinkSync(file.path); 
            } catch (unlinkError) {
                console.error("Error deleting file:", unlinkError);
            }
            
            return res.status(400).json({
                message: 'Title is required',
                success: false,
                statusCode: 400 
            });
        }

        const absolutePath = path.resolve(file.path);
        const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
        // Encode the filename for URLs with spaces
        const encodedFileName = encodeURIComponent(file.filename);
        const fileUrl = `${baseUrl}/uploads/documents/${encodedFileName}`;

        const document = new Document({
            userId: req.user._id,
            title: title.trim(),
            fileName: file.originalname,
            filePath: absolutePath,
            fileUrl,
            fileType: file.mimetype,
            fileSize: file.size,
        });
        
        // Process PDF file, in prod use queue or background job
        processPDF(document._id, absolutePath).catch((err) => {
            console.error("Error processing PDF:", err);
        });

        await document.save();
        
        res.status(201).json({
            message: 'Document uploaded successfully. Processing in background',
            success: true,
            data: document,
        });
    
    } catch (error) {
        if (req.file) {
            // Delete the uploaded file in case of error
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error("Error deleting file:", unlinkError);
            }
        }
        next(error);
    }
};

// Helper function to process PDF and chunk text
const processPDF = async (documentId, filePath) => {
    try {
        console.log(`Starting PDF processing for document: ${documentId}`);
        const {text, numPages} = await extractTextFromPDF(filePath);
        
        console.log(`Extracted ${text.length} characters from ${numPages} pages`);

        // Create text chunks
        const textChunks = chunkText(text, 500, 50);
        
        console.log(`Created ${textChunks.length} chunks`);

        // Map chunks to proper structure for DB
        const chunks = textChunks.map((chunk, index) => ({
            content: chunk.content || chunk,
            pageNumber: chunk.pageNumber || 0,
            chunkIndex: chunk.chunkIndex !== undefined ? chunk.chunkIndex : index,
        }));

        console.log(`First chunk sample:`, chunks[0]);

        // Update document with chunks and extracted text
        await Document.findByIdAndUpdate(documentId, {
            chunks: chunks,
            extractedText: text,
            processed: true,
            status: 'ready',
        }); 

        console.log(`Document ${documentId} processed successfully with ${chunks.length} chunks.`);

    } catch (error) {
        console.error("Error in processPDF:", error);
        await Document.findByIdAndUpdate(documentId, {
            processed: false,
            status: 'failed',
        }); 
    }
}

// @desc    Get user's documents 
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => { 
    try {
        const documents = await Document.aggregate([
            {
                $match: { userId: req.user._id }
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
                $lookup: {
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
            { 
                $project: {
                    flashcards: 0,
                    quizzes: 0,
                    extractTextFromPDF: 0,
                    chunks: 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);
        
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
            return res.status(404).json({ 
                message: 'Document not found', 
                success: false 
            });
        }

        // Delete associated flashcards and quizzes
        await Flashcard.deleteMany({ documentId: document._id });
        await Quiz.deleteMany({ documentId: document._id });

        // Delete the document file from storage
        try {
            if (fs.existsSync(document.filePath)) {
                fs.unlinkSync(document.filePath);
            }
        } catch (unlinkError) {
            console.error("Error deleting file:", unlinkError);
        }

        // Delete the document from the database
        await document.deleteOne();

        res.status(200).json({ 
            message: 'Document deleted successfully', 
            success: true 
        });
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
            return res.status(404).json({ 
                message: 'Document not found', 
                success: false 
            });
        }

        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id });
        document.lastAccessed = new Date();
        await document.save(); 

        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;
        
        // Ensure fileUrl is set with proper encoding
        if (!documentData.fileUrl && documentData.fileName) {
            const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
            const encodedFileName = encodeURIComponent(documentData.fileName);
            documentData.fileUrl = `${baseUrl}/uploads/documents/${encodedFileName}`;
        } else if (!documentData.fileUrl && documentData.filePath) {
            const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
            const fileName = path.basename(documentData.filePath);
            const encodedFileName = encodeURIComponent(fileName);
            documentData.fileUrl = `${baseUrl}/uploads/documents/${encodedFileName}`;
        }

        res.status(200).json({
            message: 'Document details fetched successfully',
            success: true,
            data: documentData,
        });
    } catch (error) {
        next(error);    
    }
};

// @desc    Update document title
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res, next) => {
    try {
        const documentId = req.params.id;
        const { title } = req.body;

        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                message: 'Title is required',
                success: false,
                statusCode: 400
            });
        }

        const document = await Document.findOne({ _id: documentId, userId: req.user._id });
        if (!document) {
            return res.status(404).json({ 
                message: 'Document not found', 
                success: false 
            });
        }

        document.title = title.trim();
        await document.save();

        res.status(200).json({
            message: 'Document updated successfully',
            success: true,
            data: document
        });
    } catch (error) {
        next(error);
    }
};