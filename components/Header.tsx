
import React from 'react';

interface HeaderProps {
    onReset: () => void;
    showReset: boolean;
}

const Header: React.FC<HeaderProps> = ({ onReset, showReset }) => {
  return (
    <header className="bg-base-200/50 backdrop-blur-sm p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.943 2.943a2 2 0 00-1.886 0L2.943 11.057a2 2 0 000 1.886l8.114 8.114a2 2 0 001.886 0l8.114-8.114a2 2 0 000-1.886L12.943 2.943zM12 17.25a5.25 5.25 0 110-10.5 5.25 5.25 0 010 10.5z" />
                <path d="M12 14.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
            </svg>
            <h1 className="text-2xl font-bold text-white tracking-tight">Social Poster <span className="text-brand-light">AI</span></h1>
        </div>
        {showReset && (
             <button 
                onClick={onReset}
                className="flex items-center space-x-2 bg-base-300 hover:bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V4a1 1 0 011-1zm10 8a1 1 0 011-1v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 011.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-9.45-2.566 1 1 0 111.885-.666A5.002 5.002 0 0014.001 13z" clipRule="evenodd" />
                </svg>
                 <span>Start Over</span>
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;
