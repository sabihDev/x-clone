import { Routes, Route, Navigate } from 'react-router-dom'

import HomePage from './pages/home/HomePage'
import SignupPage from './pages/auth/signup/SignupPage'
import LoginPage from './pages/auth/Login/LoginPage'
import NotificationPage from './pages/notification/NotificationPage'

import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import ProfilePage from './pages/profile/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner'

function App() {

  const { data:authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if(data.error) {
          return null;
        }
        if (!response.ok) {
          throw new Error('Something went wrong.');
        }
        console.log("data", data);
        return data;
      } catch (error) {
        console.error(error.message);
      }
    },
    retry: false
  });

  if (isLoading) {
    return <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner size='lg'/>
    </div>;
  }


  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar />}
      <Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path='/signup' element={!authUser ? <SignupPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
			</Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
  )
}

export default App
