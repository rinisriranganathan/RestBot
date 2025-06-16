
import React from 'react';

interface TasteButtonsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const TasteButtons: React.FC<TasteButtonsProps> = ({ suggestions, onSuggestionClick }) => {
  const commonButtonClasses = "px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#EDB403] focus:ring-opacity-75 transition-all duration-150 ease-in-out";

  // Style for category buttons (Appetizers, Main Courses, Desserts, Drinks)
  const categoryButtonStyle = 'bg-[#BBD69D] text-[#475424] hover:bg-[#a6c78a]';
  
  // Default style for taste profile buttons (Sweet, Spicy, etc.)
  const tasteButtonStyle = 'bg-[#475424] text-[#BBD69D] hover:bg-[#353f1c]';

  return (
    <div className="flex flex-wrap gap-2 items-start">
      {suggestions.map((suggestion) => {
        const isCategory = suggestion.startsWith('CAT:');
        const displayText = isCategory ? suggestion.substring(4) : suggestion;
        const actionText = isCategory ? `Show ${displayText}` : suggestion;
        
        const buttonStyle = isCategory ? categoryButtonStyle : tasteButtonStyle;

        return (
          <button
            key={suggestion} /* Using original suggestion as key for uniqueness */
            onClick={() => onSuggestionClick(actionText)}
            className={`${commonButtonClasses} ${buttonStyle}`}
          >
            {displayText}
          </button>
        );
      })}
    </div>
  );
};
