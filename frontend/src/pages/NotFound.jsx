import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-extrabold text-indigo-500/20 absolute">404</h1>
      <div className="relative z-10 space-y-6">
        <h2 className="text-4xl font-bold text-white">Page Not Found</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The tactical intelligence page you are looking for has been moved or encrypted. 
        </p>
        <Link 
          to="/" 
          className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
