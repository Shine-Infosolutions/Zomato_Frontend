import React from "react";
import { assets } from "../assets/assets";
import bannerImg from "../assets/dinnerbell.jpg";

const Banner = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="relative h-48 sm:h-56 md:h-64">
        <img 
          className="w-full h-full object-cover" 
          src={bannerImg} 
          alt="Dinner Bell Food Delivery" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative mt-0 z-10 text-center">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg py-4 px-4 mx-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              Dinner Bell
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-tight mb-3 break-words">
            Gorakhpur's First Food Delivery and Dining App
          </p>
          <div className="flex items-center justify-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-gray-500">Fast & Fresh Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
