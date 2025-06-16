
import React from 'react';
import type { Page } from '../App';

interface HeaderProps {
  navigateTo: (page: Page) => void;
  currentPage: Page;
}

export const Header: React.FC<HeaderProps> = ({ navigateTo, currentPage }) => {
  const handleTitleClick = () => {
    navigateTo('chat');
  };

  // Show title and subtitle unless it's the welcome or finalConfirmation page
  const showTitleAndSubtitle = currentPage !== 'welcome' && currentPage !== 'finalConfirmation';

  return (
    <header className="bg-[#475424] text-[#BBD69D] shadow-lg py-5 md:py-6 sticky top-0 z-50"> {/* BG: Dark Olive Green, Text: Pale Green */}
      <div className="container mx-auto text-center px-4">
        {showTitleAndSubtitle && (
          <>
            <h1 
              className="font-['Pacifico'] text-4xl md:text-5xl tracking-tight text-[#BBD69D] cursor-pointer" /* Apply Pacifico font, adjust size */
              onClick={handleTitleClick}
              aria-label="Fire & Froast Restaurant Title, click to go to chat"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleClick()}
            >
              Fire & Froast
            </h1>
            <p className="text-md md:text-lg mt-1 opacity-90 text-[#BBD69D]/90"> {/* Subtitle: Pale Green with opacity */}
              Chat with our AI to find your perfect meal at Fire & Froast!
            </p>
          </>
        )}
        {/* Placeholder to maintain height if title/subtitle are hidden.
            Note: Given App.tsx hides the header on 'welcome' and 'finalConfirmation' pages,
            this placeholder logic might be redundant if the header is never rendered on those pages.
            However, keeping it ensures robustness if header rendering logic changes in App.tsx.
        */}
        {!showTitleAndSubtitle && (currentPage === 'welcome' || currentPage === 'finalConfirmation') && (
            <div className="h-[calc(4rem+1.25rem)] md:h-[calc(5rem+1.5rem)]"></div> 
        )}
      </div>
    </header>
  );
};
