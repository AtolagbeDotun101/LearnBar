import React,{useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowBigLeft, ExternalLink } from 'lucide-react';





const DocumentDetailsPage = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('Content');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const data = await documentService.getDocumentById(documentId);
        setDocument(data.data);
      } catch (error) {
        toast.error('Failed to fetch document details.');
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
    }, [documentId]);

// Helper function to get the pdf url
const getPdfUrl = () => {
   if(document?.data?.filPath){
    const filePath = document.data.filPath;

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    } 
     const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
     return `${baseUrl}/${filePath.startsWith('/')? '': '/'}${filePath}}`;
   }
}

 const renderContentTab = () => {
  if(loading){
    return <Spinner />;
  }
  
  if(!document || !document.data || !document.data.filPath){
    return <div className=''>No document available.</div>;
  }
    const pdfUrl = getPdfUrl(); 
    return (
      <div className=''>
      <div className=''>
        <span className=''>
          Document Viewer </span>
          <a href={pdfUrl}
          target='_blank'
          rel='noopener noreferrer'
          className=''
          >
            <ExternalLink className='' strokeWidth={16} /> Open in New Tab
          </a>
       
      </div>
      <div className=''>
        <iframe
          src={pdfUrl}
          title='PDF Viewer'
          className=''
          frameBorder={0}
          style={{
            colorScheme: 'light'
          }}
        ></iframe>
      </div>
    </div>

    )
 }

 const renderChat=() => {
  return "Render Chat Component Here"
 }
  
const renderAIActions = () => {
  return "Render AI Actions Component Here"
}

const renderFlashcardsTab = () => {
  return "Render Flashcards Component Here"
}

const renderQuizzesTab = () => {
  return "Render Quizzes Component Here"
}

const tabs = [
    { name: 'Content', component: renderContentTab(), label: 'Content' },
    { name: 'Chat', component: renderChat(), label: 'Chat' },
    { name: 'AI Actions', component: renderAIActions(), label: 'AI Actions' },
    { name: 'Flashcards', component: renderFlashcardsTab(), label: 'Flashcards' },
    { name: 'Quizzes', component: renderQuizzesTab(), label: 'Quizzes' },
]

if(loading){
  return <Spinner />;
}

if(!document){
  return <div className=''>Document not found.</div>;
}

  return (
    <div></div>
  )

  
}

export default DocumentDetailsPage