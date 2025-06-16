import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-[#EDB403]/10 border-l-4 border-[#EDB403] text-[#1E2229] p-4 rounded-md shadow-md my-4" role="alert"> {/* Accent: Golden Yellow, Text: Dark Charcoal */}
      <p className="font-bold text-[#1E2229]">Oops! Something went wrong.</p> {/* Dark Charcoal text */}
      <p>{message}</p>
    </div>
  );
};