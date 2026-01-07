import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'

const ProtectedRoutes = () => {
    const isAuthenticated = true // Replace with actual authentication logic
    const loading = true // Replace with actual loading state

    if (loading) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <p>Loading...</p>
            </div>
        )
    }
  return isAuthenticated ? (
   <AppLayout>
    <Outlet />
   </AppLayout>

  ) : (
    <Navigate to="/login" replace />
  )
}

export default ProtectedRoutes