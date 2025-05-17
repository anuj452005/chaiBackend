import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-9xl font-bold text-gray-200">404</div>
      
      <h1 className="text-3xl font-bold mt-8 mb-4">Page Not Found</h1>
      
      <p className="text-gray-600 text-center max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/" className="btn btn-primary flex items-center justify-center">
          <FaHome className="mr-2" /> Go to Homepage
        </Link>
        
        <Link to="/" className="btn bg-gray-200 text-gray-800 flex items-center justify-center">
          <FaSearch className="mr-2" /> Search Videos
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
