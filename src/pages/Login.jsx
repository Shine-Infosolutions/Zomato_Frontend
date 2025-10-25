import React from 'react'
import Banner from '../components/Banner'
import AuthForm from '../components/AuthForm'
import bannerImg from '../assets/dinnerbell.jpg'

const Login = () => {
  
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${bannerImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="h-screen bg-black/40 flex flex-col overflow-hidden">
        {/* Header - compact */}
        <div className="pt-6 pb-2 px-4 text-center flex-shrink-0">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-red-600 to-red-700 rounded-full mb-2 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-1 drop-shadow-lg">Dinner Bell</h1>
          <p className="text-gray-200 text-xs drop-shadow">Delicious food delivered to your door</p>
        </div>

        {/* Auth Form - centered */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <AuthForm/>
          </div>
        </div>

        {/* Footer - compact */}
        <div className="pb-4 px-4 text-center flex-shrink-0">
          <p className="text-xs text-gray-300 drop-shadow">
            By continuing, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
