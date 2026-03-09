import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-lg text-center">
        
        {/* 404 Icon/Illustration */}
        <div className="mb-8">
          <svg
            className="w-40 h-40 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Main Message */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-6">
          Oops! Page Not Found
        </h2>

        {/* Helpful Message */}
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't seem to exist. Here are some helpful links:
        </p>

        {/* Navigation Suggestions */}
        <div className="space-y-4 mb-8">
          <Link
            to="/"
            className="block w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition duration-200"
          >
            Return Home
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/contact"
              className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 rounded-lg text-gray-700 font-medium border border-gray-200 transition duration-200"
            >
              Contact Support
            </Link>
            <Link
              to="/search"
              className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 rounded-lg text-gray-700 font-medium border border-gray-200 transition duration-200"
            >
              Search Site
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <p className="text-sm text-gray-500">
          If you think this is a mistake, please{" "}
          <Link to="/contact" className="text-indigo-600 hover:underline">
            let us know
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default NotFound;