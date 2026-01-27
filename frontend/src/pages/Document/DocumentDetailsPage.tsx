import React, {useState, useEffect} from 'react';
import { Link, useParams } from 'react-router-dom';
import documentService from '../../service/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AiActions from '../../components/ai/AiActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import QuizManager from '../../components/quizzes/QuizManager';

const DocumentDetailsPage = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Content');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await documentService.getDocumentById(documentId);
        console.log('Full API Response:', response);
        console.log('Document data:', response.data);
        setDocument(response.data);
      } catch (error) {
        toast.error('Failed to fetch document details.');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [documentId]);

  // Helper function to get the pdf url
  const getPdfUrl = () => {    
    if (!document) {
      return '';
    }
    
    // Check if fileUrl exists and use it
    if (document.fileUrl) {
      return document.fileUrl;
    }
    
    // Fallback to constructing URL from filePath
    if (document.filePath) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      // Extract just the filename from the full path
      const fileName = document.filePath.split(/[/\\]/).pop();
      const constructedUrl = `${baseUrl}/uploads/documents/${fileName}`;
      return constructedUrl;
    }
    
    console.log('No URL available');
    return '';
  };

  const renderContentTab = () => {    
    if (loading) {
      return (
        <div className='flex items-center justify-center p-12'>
          <Spinner />
        </div>
      );
    }
    
    if (!document) {
      return (
        <div className='text-center p-8 bg-white rounded-lg border border-gray-200'>
          <p className='text-gray-600'>No document available.</p>
        </div>
      );
    }
    
    const pdfUrl = getPdfUrl();
    
    if (!pdfUrl) {
      return (
        <div className='text-center p-8 bg-white rounded-lg border border-gray-200'>
          <p className='text-gray-600'>Document file not found.</p>
          <p className='text-sm text-gray-500 mt-2'>File path: {document.filePath || 'N/A'}</p>
        </div>
      );
    }
    
    return (
      <div className='bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm'>
        <div className='flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300'>
          <span className='text-sm font-medium text-gray-700'>
            Document Viewer
          </span>
          <a 
            href={pdfUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors'
          >
            <ExternalLink className='w-4 h-4' strokeWidth={2} /> 
            Open in New Tab
          </a>
        </div>
        <div className='bg-gray-100 p-1'>
          <iframe
            src={pdfUrl}
            title='PDF Viewer'
            className='w-full h-[70vh] bg-white rounded border border-gray-300'
            style={{
              colorScheme: 'light'
            }}
          />
        </div>
      </div>
      
    );
  };

  const renderChat = () => {
    return (
      <ChatInterface />
    );
  };
  
  const renderAIActions = () => {
    return <AiActions/>
  };

  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={documentId || ''} />
  };

  const renderQuizzesTab = () => {
    return <QuizManager documentId={documentId || ''}/>
  };

  // Create tabs array with functions that return components
  const tabs = [
    { name: 'Content', component: renderContentTab(), label: 'Content' },
    { name: 'Chat', component: renderChat(), label: 'Chat' },
    { name: 'AI Actions', component: renderAIActions(), label: 'AI Actions' },
    { name: 'Flashcards', component: renderFlashcardsTab(), label: 'Flashcards' },
    { name: 'Quizzes', component: renderQuizzesTab(), label: 'Quizzes' },
  ];

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Spinner />
      </div>
    );
  }

  if (!document) {
    return (
      <div className='text-center p-8'>
        <p className='text-gray-600 text-lg'>Document not found.</p>
        <Link 
          to='/documents' 
          className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-4'
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-4'>
          <Link 
            to='/documents' 
            className='inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors'
          >
            <ArrowLeft size={16} />
            Back to Documents
          </Link>
        </div>
        <PageHeader title={document.title} />
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default DocumentDetailsPage;