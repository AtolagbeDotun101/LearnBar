import React, {useState, type ReactNode} from 'react'
import Sidebar from './Sidebar';
import Header from './Header';

const AppLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = ()=>{
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className='flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 text-neutral-900'>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
      <div className='flex-1 flex flex-col overflow-hidden'>
        <Header toggleSidebar={toggleSidebar}/>
        <main className='flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout