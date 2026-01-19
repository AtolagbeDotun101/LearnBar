export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },

  DOCUMENTS: {
    UPLOAD: "/api/documents",
    GET_DOCUMENTS: "/api/documents",
    GET_DOCUMENT_BY_ID: (documentId: string) => `/api/documents/${documentId}`,
    UPDATE_DOCUMENT: (documentId: string) => `/api/documents/${documentId}`,
    DELETE_DOCUMENT: (documentId: string) => `/api/documents/${documentId}`,
  },

  AI: {
    GENERATE_FLASHCARDS: "/api/ai/generate-flashcards",
    GENERATE_QUIZ: "/api/ai/generate-quiz",
    GENERATE_SUMMARY: "/api/ai/generate-summary",
    CHAT: "/api/ai/chat",
    EXPLAIN_CONCEPT: "api/ai/explain-concept",
    GET_CHAT_HISTORY: (documentId: string) =>  `api/ai/chat-history/${documentId}`
  },
  FLASHCARDS: {
  GET_ALL_FLASHCARD_SETS: "/api/flashcards",
  GET_FLASHCARDS_FOR_DOC: (documentId: string) => `/api/flashcards/${documentId}`,
  REVIEW_FLASHCARD: (cardId: string) => `/api/flashcards/${cardId}/review`,
  TOGGLE_STAR: (cardId: string) => `/api/flashcards/${cardId}/star`,
  DELETE_FLASHCARD_SET: (id: string) => `/api/flashcards/${id}`,
},

QUIZZES: {
  GET_QUIZZES_FOR_DOC: (documentId: string) => `/api/quizzes/${documentId}`,
  GET_QUIZ_BY_ID: (id: string) => `/api/quizzes/quiz/${id}`,
  SUBMIT_QUIZ: (id: string) => `/api/quizzes/${id}/submit`,
  GET_QUIZ_RESULTS: (id: string) => `/api/quizzes/${id}/results`,
  DELETE_QUIZ: (id: string) => `/api/quizzes/${id}`,
},

PROGRESS: {
  GET_DASHBOARD: "/api/progress/dashboard",
},

}