import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Sparkles, AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../common/Spinner";
import MarkdownRender from "../common/MarkdownRender";
import aiService from "../../service/aiService.js";
import toast from "react-hot-toast";

interface Message {
  role: string;
  content: string;
  timestamp: Date;
  relevantChunks?: any;
  isError?: boolean;
}

const ChatInterface = () => {
  const { documentId } = useParams();
  const { user } = useAuth();
  const [history, setHistory] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        setHistory(response.data || []);
      } catch (error) {
        console.log("Failed to get chat history:", error);
        toast.error("Failed to load chat history");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchChatHistory();
  }, [documentId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);
      
      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.answer || response.data.response,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks,
      };
      
      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.log("Chat error:", error);
      
      let errorContent = "Sorry, I encountered an error. Please try again.";
      
      // Handle specific error types
      if (error.response?.status === 429) {
        errorContent = "I'm currently experiencing high demand. Please try again in a few moments.";
        toast.error("Rate limit reached. Please wait a moment.");
      } else if (error.response?.status === 400) {
        errorContent = error.response?.data?.message || "The document is still being processed. Please wait a moment.";
        toast.error(errorContent);
      } else {
        toast.error("Failed to get response");
      }
      
      const errorMessage: Message = {
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
        isError: true,
      };
      
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg: Message, index: number) => {
    const isUser = msg.role === 'user';
    const isError = msg.isError;

    return (
      <div key={index} className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
        {!isUser && (
          <div className={`w-9 h-9 rounded-xl ${
            isError 
              ? 'bg-gradient-to-br from-red-400 to-orange-400 shadow-lg shadow-red-500/25'
              : 'bg-gradient-to-br from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/25'
          } flex items-center justify-center shrink-0`}>
            {isError ? (
              <AlertCircle className="w-4 h-4 text-white" strokeWidth={2} />
            ) : (
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
            )}
          </div>
        )}
        
        <div className={`max-w-lg p-4 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-br-md'
            : isError
            ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-md'
            : 'bg-white border border-slate-200/60 text-slate-800 rounded-bl-md'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed">{msg.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-slate">
              <MarkdownRender content={msg.content} />
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-semibold text-sm shrink-0 shadow-sm">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl items-center justify-center shadow-xl shadow-slate-200/50">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 items-center justify-center flex mb-4">
          <MessageSquare className="w-7 h-7 text-emerald-600" strokeWidth={2} />
        </div>
        <Spinner />
        <p className="text-sm text-slate-500 mt-3 font-medium">
          Loading chat history...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Message Area */}
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-slate-50/50 via-white/50 to-slate-50/50">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
              <MessageSquare className="w-8 h-8 text-emerald-600" strokeWidth={2} />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-slate-500 text-sm">
              Ask me anything about the document!
            </p>
          </div>
        ) : (
          history.map(renderMessage)
        )}
        
        <div ref={messagesEndRef} />
        
        {loading && (
          <div className="flex items-start gap-3 my-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200/60">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-slate-200/60 bg-white/80">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question about this document..."
            className="flex-1 h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10 placeholder:text-slate-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center"
          >
            <Send className="w-5 h-5" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;