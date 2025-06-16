
import React from 'react';

interface WelcomePageProps {
  onStartExploring: () => void;
  menuLoadingError: string | null; // To display if initial menu load fails
  isMenuLoading: boolean; // To disable button while menu is loading
}

const WelcomePage: React.FC<WelcomePageProps> = ({ 
  onStartExploring, 
  menuLoadingError, 
  isMenuLoading 
}) => {

  const cantStartExploring = isMenuLoading || (menuLoadingError !== null && !isMenuLoading);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="mt-16 sm:mt-24 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-['Pacifico'] text-[#475424] mb-8">
          Welcome to Fire & Froast!
        </h1>
        <button
          onClick={onStartExploring}
          disabled={cantStartExploring}
          className="bg-[#EDB403] text-[#1E2229] font-semibold py-3 px-8 rounded-lg hover:bg-[#c9a002] focus:outline-none focus:ring-2 focus:ring-[#475424] focus:ring-opacity-75 transition-colors duration-150 text-lg sm:text-xl mb-6 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Start exploring Fire & Froast menu"
        >
          {isMenuLoading ? 'Loading Menu...' : 'Start Exploring'}
        </button>

        {cantStartExploring && (
          <div className="my-2 p-3 max-w-md w-full">
            {isMenuLoading && (
              <div className="text-sm text-[#475424]">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#EDB403] mx-auto mb-1"></div>
                Preparing your culinary experience...
              </div>
            )}
            {menuLoadingError && !isMenuLoading && (
              <div className="text-sm text-red-700 bg-red-100 border border-red-400 p-3 rounded-md shadow-sm" role="alert">
                <strong className="font-semibold">Menu Load Error:</strong> {menuLoadingError}
              </div>
            )}
          </div>
        )}
        
        {/* The menu guide block has been removed from here */}
      </div>
    </div>
  );
};

export default WelcomePage;
