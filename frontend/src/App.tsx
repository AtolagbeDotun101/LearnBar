import React from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import DocumentDetailsPage from './pages/Document/DocumentDetailsPage'
import FlashcardListPage from './pages/Flashcard/FlashcardListPage'
import FlashcardPage from './pages/Flashcard/FlashcardPage'
import ProfilePage from './pages/Profile/ProfilePage'
import QuizPage from './pages/Quiz/QuizPage'
import QuizResultPage from './pages/Quiz/QuizResultPage'
import ProtectedRoutes from './components/auth/ProtectedRoutes'

const App = () => {
  const isAuthenticated = true // Replace with actual authentication logic
  const loading = true // Replace with actual loading state

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>Loading...</p>
      </div>
    )
  }

  return(
    <Router>
      <Routes>
        <Route path='/'
        element = {isAuthenticated ? <Navigate to="/dashboard"  replace/> : <Navigate to="/login" replace />}/>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element = {<ProtectedRoutes />} >
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/documents' element={<DocumentDetailsPage />} />
        <Route path='/documents/:id' element={<DocumentDetailsPage />} />
        <Route path='/flashcards' element={<FlashcardListPage />} />
        <Route path='/flashcards/:id' element={<FlashcardPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/quiz/:quizId' element={<QuizPage />} />
        <Route path='/quiz/:quizId/result' element={<QuizResultPage />} />
      </Route>
        <Route path='*' element= {<NotFoundPage />} />
      </Routes>
    </Router>
  )


}


export default App