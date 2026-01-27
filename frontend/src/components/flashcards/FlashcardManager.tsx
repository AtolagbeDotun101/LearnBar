import React, {useState, useEffect} from 'react';
import { ChevronLeft, ChevronRight,Plus, Trash2, Sparkles, Brain, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';
import flashcardService from '../../service/flashcardService';
import aiService from '../../service/aiService';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';
import FlashCard from './FlashCard';

interface FlashcardManagerProp {
    documentId: string
}

const FlashcardManager = ({documentId}: FlashcardManagerProp) => {
    const [flashcardSets, setFlashcardSets] = useState<any>([]);
    const [selectedSet, SetSelectedSet] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState<any | null>(null);

    const fetchFlashcardSet = async ()=>{
        setLoading(true)
        try {
            const response = await flashcardService.getFlashcardsForDoc(
                documentId
            );
            setFlashcardSets(response.data);
        } catch (error) {
            toast.error("Failed to fetch flashcard sets.")
            console.log(error);
            
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        if(documentId){
            fetchFlashcardSet()
        }
    }, [documentId]);

    const handleGenerateFlashcards = async ()=>{
        setGenerating(true)
        try {
            await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully");
            fetchFlashcardSet();
        } catch (error:any) {
         toast.error(error.message||"Failed to generate Flashcards.")   
        }finally{
            setGenerating(false)
        }
    }

    const handleNextCard = ()=>{
        if(selectedSet){
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex + 1) % selectedSet.cards.lenght
            );
        }
    }

    const handlePrevCard = ()=>{
        if(selectedSet){
            handleReview(currentCardIndex);
             setCurrentCardIndex(
          (prevIndex) => (prevIndex - 1) % selectedSet.cards.lenght  
        );
    }
    
    }

    const handleReview = async (index:number) =>{
        const currentCard = selectedSet?.cards[currentCardIndex];
        if(!currentCard) return;
        try {
            await flashcardService.reviewFlashcard(currentCardIndex);
            toast.success('Flashcard reviewed successfully!')
        } catch (error) {
            toast.error('Failes to review flashcard.')
        }
    }

    const handleToggleStar =async (cardId:any) => {
        try {
            await flashcardService.toggleStar(cardId)
           
                const updatedSets = flashcardSets.map((set: any)=>{
                     if(set._id === selectedSet._id){
                        const updatedCards = set.cards.map((card:any )=>
                        card._id === cardId ? {...card, isStarred: !card.isStarred}: card);
                        return {...set, cards: updatedCards}
                     }
                     return set;
                })
                setFlashcardSets(updatedSets);
                SetSelectedSet(updatedSets.find((set:any)=> set._id === selectedSet._id));
                toast.success("Flashcard starred status updated ")
           
        } catch (error) {
            toast.error("Failed to update star status")
        }
    }

    const handleDeleteRequest =(e:any, set:any) =>{
        e.stopPropagation()
        setSetToDelete(set);
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async ()=>{
         if(!setToDelete)return;
         setDeleting(true)
         try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            toast.success("Flashcard set deleted successfully")
            setIsDeleteModalOpen(false)
            setToDelete(null)
            fetchFlashcardSet();
         } catch (error:any) {
            toast.error(error.message || "Failed to delete flashcard set.")
         }finally{
            setDeleting(false);
         }
    }

    const handleSelectedSet = (set:any)=>{
        SetSelectedSet(set)
        setCurrentCardIndex(0);
    }

    const renderFlashcardReviewer = ()=>{ 
        const currentCard = selectedSet.cards[currentCardIndex]
        return (
            <div className='space-y-8'>
                {/* Back Button */}
                <button
                onClick={()=> SetSelectedSet(null)}
                className='group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200'>
                    <ArrowLeft 
                    className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-200'
                    strokeWidth={2}
                    /> 
                    Back to sets
                </button>

                {/* Flashcrad Display */}
                <div className='flex flex-col items-center space-y-8'>
                    <div className='w-full max-w-2xl'>
                        <FlashCard
                        flashcard={currentCard}
                        onToggleStar={handleToggleStar}
                        />
                    </div>
                    {/* Nav controls */}
                    <div className='flex items-center gap-6'>
                        <button
                        onClick={handlePrevCard}
                        disabled={selectedSet.cards.length <= 1}
                        className='group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slat700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-100'>
                            <ChevronLeft
                            className='w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200'
                            strokeWidth={2.5}
                            />
                            Previous
                        </button>

                        <div className='px-4 py-2 bg-slate-50 rounded-lg border border-slate-200'>
                            <span className='text-sm font-semibold text-slate-700'>{currentCardIndex +1}{" "}
                                <span className='text-slate-400 font-normal'>/</span>{" "}
                                {selectedSet.cards.length}
                            </span>
                        </div>

                        <button
                        onClick={handleNextCard}
                        disabled={selectedSet.cards.length <= 1}
                        className='group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100'
                        >
                            Next
                            <ChevronRight
                            className='w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200'
                            strokeWidth={2.5}
                            />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const renderSetList = ()=>{
        if(loading){
            return(
                <div className='flex items-center justify-center py-20'>
                    <Spinner />
                </div>
            )
        }
 
        if(flashcardSets.length === 0){
            return(
            <div className='flex flex-col items-center justify-center py-16 px-6'>
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 mb-2'>
                    <Brain className='w-8 h-8 text-emerald-600 mb-2' strokeWidth={2} />
                </div>
                <h3 className='text-xl font-semibold text-slate-900 mb-2'>No Flashcards Yet</h3>
                <p className='text-sm text-slate-500 mb-8 text-center max-w-sm'> Generate flashcards from your document to start learning and reinforce your knowledge</p>
                <button
                onClick={handleGenerateFlashcards}
                disabled={generating}
                className='group inline-flex items-center gap-2 px-6 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'>
                    {generating ? (
                        <>
                        <div className= 'w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'>
                            Generating...
                        </div>
                        </>
                    ) : (
                        <>
                        <Sparkles className='w-4 h-4' strokeWidth={2}/>
                        Generate Flashcards
                        </>
                    )}
                </button>
            </div>

             
        );  
        }

        return(
            <div className='space-y-6'>
                {/* Header with Generate  Button */}
                <div className='flex items-center justify-between'>
                    <div >
                        <h3 className='text-lg font-semibold text-slate-900'>
                            Your FlashcardSets
                        </h3>
                        <p className='text-sm text-slate-50 mt-1'>
                            {flashcardSets.length} {" "}
                            {flashcardSets.length === 1 ? "set" : 'sets'} available
                        </p>
                    </div>
                    <button
                    onClick={handleGenerateFlashcards}
                    disabled={generating}
                    className='group inline-flex items-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
                    >
                        {generating ? (
                            <>
                            <div className='w-4 h-4 border-2 border-t-white rounded-full animate-spin'/>
                            Generating...
                            </>
                        ): (
                            <>
                            <Plus className='w-4 h-4' strokeWidth={2} />
                             Generate New Set
                            </>
                        )}
                    </button>
                </div>

                {/* Flasgcards Sets Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {flashcardSets.map((set:any)=>(
                        <div className='group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer duration-200 transition-all hover:shadow-lg hover:shadow-emerald-500/10'
                        key={set._id}
                        onClick={()=> handleSelectedSet(set)}>
                            {/* Delete Button */}
                            <button onClick={(e:any)=>handleDeleteRequest(e,set)}
                                className='absolute top-4 right-2 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100'>
                                    <Trash2 className='w-4 h-4' strokeWidth={2} />
                                </button>

                                {/* Set Content */}
                                <div className='space-y-4'>
                                    <div className='inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100  '>
                                        <Brain className='w-6 h-6 text-emerald-600' strokeWidth={2}/>
                                    </div>

                                    <div>
                                        <h4 className='text-base font-semibold text-slate-900 mb-1'>
                                            Flashcard Set
                                        </h4>
                                        <p className='text-xs font-medium text-slate-500 uppercase tracking-wide'>Created {moment(set.createdAt).format("MMM D, YYYY")}</p>
                                    </div>

                                    <div className='flex items-center gap-2 pt-2 border-t border-slate-100'>
                                        <div className='px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg'>
                                            <span className='text-sm font-semibold text-emerald-700'> 
                                                {set.cards.length}{" "}
                                                {set.cards.length === 1 ? 'card' : 'cards '}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                        </div>
                    ))}
                </div>
            </div>
        )
        
    }

  return (
    <>
     <div className='bg-white/80 backdrop-blur-xl border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8'>
        {selectedSet ? renderFlashcardReviewer() : renderSetList()}
    </div>

    {/* Delete Confirmation Modal */}
    <Modal
    isOpen={isDeleteModalOpen}
    onClose={()=> setIsDeleteModalOpen(false)}
    title='Delete Flashcard Set?'>
            <div className='soace-y-6'>
                <p className='text-sm text-slate-600'>
                    Are you sure you want to delete this flashcard set? This action cannot be undone and all cards will be removed permanently.
                </p>
                <div className='flex items-center justify-end gap-3 pt-2'>
                    <button
                    type="button"
                    onClick={()=> setIsDeleteModalOpen(false)}
                    disabled= {deleting}
                    className='px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                        Cancel
                    </button>

                    <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className='px-5 h-11 bg-linear-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold  text-sm rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100'>
                        {deleting ? (
                            <span className='flex items-center gap-2'>
                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'/>
                                Deleting...
                            </span>
                        ): (
                            "Delete Set"
                        )}
                    </button>
                </div>
            </div>
    </Modal>
    </>
   
  )
}

export default FlashcardManager