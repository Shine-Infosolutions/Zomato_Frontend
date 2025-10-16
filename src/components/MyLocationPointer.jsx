import React from 'react';

const MyLocationPointer = ({ size = 24, className = "" }) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer pulsing circle */}
      <div 
        className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"
        style={{ 
          width: size, 
          height: size,
          animationDuration: '2s'
        }}
      />
      
      {/* Middle circle */}
      <div 
        className="absolute bg-blue-500 rounded-full border-2 border-white shadow-lg"
        style={{ 
          width: size * 0.7, 
          height: size * 0.7,
          top: size * 0.15,
          left: size * 0.15
        }}
      />
      
      {/* Inner dot */}
      <div 
        className="absolute bg-white rounded-full"
        style={{ 
          width: size * 0.3, 
          height: size * 0.3,
          top: size * 0.35,
          left: size * 0.35
        }}
      />
    </div>
  );
};

export default MyLocationPointer;