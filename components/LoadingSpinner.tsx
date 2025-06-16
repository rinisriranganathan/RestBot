import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#EDB403]"></div> {/* Spinner: Golden Yellow */}
      <p className="mt-4 text-[#1E2229] font-semibold text-lg">Finding your perfect flavor...</p> {/* Dark Charcoal text */}
    </div>
  );
};