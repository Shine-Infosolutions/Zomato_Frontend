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
      <div className="min-h-screen bg-black/40 flex flex-col">
        <Banner />
        <div className="flex-1 flex items-start justify-center pt-2">
          <AuthForm/>
        </div>
      </div>
    </div>
  )
}

export default Login
