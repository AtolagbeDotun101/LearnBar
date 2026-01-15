import React, {useState,useEffect} from 'react';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { Trash2, X, FileText, Plus, Upload } from 'lucide-react';
import documentService from '../../service/documentService';
import Button from '../../components/common/Button';
import DoumentCard from '../../components/documents/DocumentCard';

const DocumentListPage = () => {
const [documents, setDocuments]= useState<any>([]);
const [loading, setLoading]= useState(true);

//state for upload modal
const [isUploadModalOpen, setIsUploadModalOpen]= useState(false);
const [uploadFile, setUploadFile]= useState<File | null>(null);
const [uploadTitle, setUploadTitle]= useState("");
const [uploading, setUploading]= useState(false);

//state for deleting confirmation model
const [isDeleteModalOpen, setIsDeleteModalOpen]= useState(false);
const [selectedDoc, setSelectedDoc]= useState<any | null>(null);
const [deleting, setDeleting]= useState(false);

const fetchDocuments = async ()=>{
  try {
    const response = await documentService.getDocuments();
    setDocuments(response.data);
  } catch (error) {
    toast.error("Failed to fetch documents");
    console.log("Fetch documents error: ", error);
  }finally{
    setLoading(false);
};

}

useEffect(()=>{
  fetchDocuments();
}, []);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
  const files = e.target.files;
  if(files && files[0]){
    const file = files[0];
    setUploadFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, "")); //remove file extension
  }
}

const handleUpload = async (e: React.FormEvent<HTMLFormElement>)=>{
  e.preventDefault();
  if(!uploadFile || !uploadTitle){
    toast.error("Please select a file and enter a title");
    return;
  }
  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    await documentService.uploadDocument(formData);
    toast.success("Document uploaded successfully");
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setUploadTitle("");
    setLoading(true);
    fetchDocuments();
  } catch (error) {
    toast.error("Failed to upload document");
    console.log("Upload document error: ", error);
  }finally{
    setUploading(false);
  }
}

const handleDeleteRequest = (doc: any) =>{
  setSelectedDoc(doc);
  setIsDeleteModalOpen(true);
}

const handleConfirmDelete = async ()=>{
  if(!selectedDoc){
    toast.error("No document selected");
    return;
  }
  setDeleting(true);
  try {
    await documentService.deleteDocument(selectedDoc._id);
    toast.success(`Document "${selectedDoc.title}" deleted successfully`);
    setIsDeleteModalOpen(false);
    setSelectedDoc(null);
    setLoading(true);
    setDocuments(documents.filter(doc=> doc._id !== selectedDoc._id));
  } catch (error) {
    toast.error("Failed to delete document");
    console.log("Delete document error: ", error);
  }finally{
    setDeleting(false);
  }
}

 console.log((Boolean(documents.length === 0)));

const renderContent = ()=> {
  if(loading){
    return (
      <div className='flex items-center justify-center min-h[400px]'>
        <Spinner />
      </div>
    )
  }
  if(documents.length === 0){
    return(
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center max-w-md'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6'>
            <FileText
            className='w10 h-10 text-slate-400'
            strokeWidth={1.5}
            />
          </div>
          <h3 className='text-xl font-medium text-slate-900 tracking-tight mb-2'>No Documents Yet</h3>
          <p className='text-sm text-slate-500 mb-6'>Get started by uploading your first document to begin learning.</p>
          <button 
          onClick={()=> setIsUploadModalOpen(true)}
          className='inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white  text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 active:scale-[0.98]'
          >
            <Plus className='w-4 h-4' strokeWidth={2.5} /> 
            Upload Document
          </button>
        </div>
      </div>
    );
  }else{
    
    return(  
      <div className=' grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
        {documents.map((doc:any)=> (
          <DoumentCard 
          key={doc._id} 
          document={doc} 
          onDelete={()=> handleDeleteRequest(doc)} />
        ))}
      </div>
    );
  
  }
  
}
  

  return (
    <div className='min-h-screen'>
      {/* Subtle backgrounds pattern */}
      <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none' />
      <div className='relative max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-10'>

          <div className=''>

            <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>My Documents</h1>

            <p className='text-slate-500 text-sm'>Manage and organize your learning materials</p>
          </div>
          { !loading && (
            <Button onClick={()=> setIsUploadModalOpen(true)}>
              <Plus className='w-4 h-4' strokeWidth={2.5} /> 
              Upload Document
            </Button>
            )}
        </div>

      {renderContent()}
      </div>
    </div>
  )
}

export default DocumentListPage