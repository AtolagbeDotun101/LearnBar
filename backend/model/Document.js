import mongoose from "mongoose";

const documentSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true, 
        },
        fileName: {
            type: String,
            required: [true, 'File name is required'],
        },
        filePath: {
            type: String,
            required: [true, 'File path is required'],
        },
        fileUrl: {
            type: String
        },
        fileType: {
            type: String,
            default: 'application/pdf',
        },
        fileSize: {
            type: Number,
            required: [true, 'File size is required'],
        },
        extractedText: {
            type: String,
            default: '',
        },
        numPages: {
            type: Number,
            default: 0,
        },
        chunks: [{
            content: {
                type: String,
                required: [true, 'Chunk content is required'],
            },
            pageNumber: {
                type: Number,
                default: 0,
            },
            chunkIndex: {
                type: Number,
                required: [true, 'Chunk index is required'],
            },
        }],
        processed: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['processing', 'ready', 'failed'],
            default: 'processing',
        },
        lastAccessed: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Index to optimize queries by userId and createdAt
documentSchema.index({ userId: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;