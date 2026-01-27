import React, {useState, useEffect} from 'react';
import flashcardService from '../../service/flashcardService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard';
import toast from 'react-hot-toast';

const FlashcardListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const fetchFlashcardSet = async ()=>{
      try {
        const response = await flashcardService.getAllFlasgcardSets();
        setFlashcardSets(response.data);
      } catch (error) {
        toast.error('Failed to fetch flashcard sets.')
      }finally{
        setLoading(false)
      }
    }
    fetchFlashcardSet();
  }, [])


  const renderContent = ()=>{
    if(loading){
      return(
        <Spinner />
      )
    }

    if(flashcardSets.length === 0){
      return(
        <EmptyState
        title='No flashcard Set Found'
        description="You haven't generated any flashcards yet!. Go to a document to create your first set. "
        />
      )
    }

    return(
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {flashcardSets.map((set:any)=> (
          <FlashcardSetCard key={set._id} flashcardSet={set}/>
        ))}
      </div>
    )
  }
  return (
    <div>
      <PageHeader title='All Flashcard Sets' />
      {renderContent()}
    </div>
  )
}

export default FlashcardListPage