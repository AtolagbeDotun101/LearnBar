import React, {useState, useEffect} from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import aiService from '../../service/aiService';
import flashcardService from '../../service/flashcardService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import FlashCard from '../../components/flashcards/FlashCard';

const FlashcardPage = () => {

  const {id: documentId} = useParams();
  const [FlashcardSets , setFlashcardSets] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<any>([]);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFlashcards = async ()=>{
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(documentId);
      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      toast.error('Failed to get flashcards')
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchFlashcards
  }, [documentId])

  const handleGenerateFlashcards = async()=>{
    setGenerating(true);
    try {
      const response = await aiService.generateFlashcards(documentId);
      toast.success('Flashcards generated successfully');
      fetchFlashcards();
    } catch (error) {
      toast.error('Failed to generate Flashcard')
    }finally{
      setGenerating(false);
    }
  }

  const handleNextCard = ()=>{
    handleReview(currentCardIndex)
    setCurentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length)
  };

  const handlePrevCard = ()=>{
    handleReview(currentCardIndex)
    setCurentCardIndex((prevIndex) => (prevIndex - 1) % flashcards.length)
  
  }

  const handleReview = async(index:any) =>{
    const currentCard = flashcards[currentCardIndex];
    if(!currentCard)return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      toast.success("Flashcard reviewed");
    } catch (error) {
      toast.error("Failed to review flashcard.")
    }
  }

  const hanldeToggleStar = async (cardId:any) =>{
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFashcards:any)=> 
        prevFashcards.map((card:any)=> card._id === cardId ? {...card, isStarred: !card.isStarred} : card));
      toast.success('Flashcard starred status updated!')
    } catch (error) {
      toast.error("Failed to update star status.")
    }
  }


  const handleDeleteFlashcardSet = async()=>{
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(FlashcardSets._id);
      setIsDeleteModalOpen(false);
      fetchFlashcards();
    } catch (error:any) {
      toast.error(error.message || "Failed to delete flashcard set.")
    }finally{
      setDeleting(false);
    }
  }


  const renderFlashcardContent = ()=>{

    if(loading){
     return <Spinner />
    }

    if(flashcards.length === 0){
      return(
        <EmptyState 
        title='No Flashcards Yet'
        description='Generate flashcards from your document to start learning.'
        />
      )
    }

    const currentCard = flashcards[currentCardIndex];
    return(
      <div className='flex flex-col items-center space-y-6'>
        <div className='w-full max-w-md'>
          <FlashCard flashcard={currentCard} onToggleStar={hanldeToggleStar} />
        </div>
        <div className='flex items-center gap-4'>
          <Button 
          onClick={handlePrevCard}
          variant='secondary'
          disabled={ flashcards.length <= 1}
        >
          <ChevronLeft size={16} /> Previous
        </Button>

        <span className='text-sm text-neutral-600'>
          {currentCardIndex + 1} / {flashcards.length}
        </span>
        <Button 
        onClick={handleNextCard}
        variant='secondary'
        disabled = {flashcards.length <= 1}
        >
          Next <ChevronRight size={16} />
        </Button>
        </div>
      </div>
    )
  }
  return (
    <div>
    <div className='mb-2'>
      <Link 
      to={`/documents/${documentId}`}
      className='inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors'
      >
        <ArrowLeft size={16} />
        Back to Document
      </Link>
    </div>
    <PageHeader title='Flashcards'>
      <div className='flex gap-2'>
        {!loading && 
        (
          flashcards.length > 0 ?(
            <Button
            onClick={()=> setIsDeleteModalOpen(true)}
            disabled = {deleting}
            >
              <Trash2 size={16}/> Delete Set
            </Button>
          ):(
            <Button onClick={handleGenerateFlashcards} disabled={generating}>
              {generating ? (
                <Spinner/>
              ) : (
                <>
                <Plus size={16}/> Generate Flashcards
                </>
              )}
            </Button>
          )
        )}
      </div>
    </PageHeader>

    {renderFlashcardContent()}

    <Modal
    isOpen={isDeleteModalOpen}
    onClose={()=> setIsDeleteModalOpen(false)}
    title='Confirm Delete Flashcard Set'
    >
      <div className='space-y-4'>
        <p className='text-sm text-neutral-600'>
          Are you sure you want to delete all flahcards for this document?
          Tjis action cannot be undone
        </p>
        <div className='flex justify-end gap-2 pt-2'>
          <Button
          type='button'
          variant='secondary'
          onClick={()=>setIsDeleteModalOpen(false)}
          >Cancel</Button>
          <Button
          classname='bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500'
          onClick={handleDeleteFlashcardSet}
          disabled ={deleting}
          >
            {deleting ? 'Deleing...' : 'Delete'}
          </Button>
        
        </div>
      </div>
    </Modal>
     </div>
  )
}

export default FlashcardPage