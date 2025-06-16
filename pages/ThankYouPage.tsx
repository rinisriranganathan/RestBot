
import React, { useEffect } from 'react';

interface ThankYouPageProps {
  onTimeout: () => void;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ onTimeout }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout();
    }, 10000); // 10 seconds

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [onTimeout]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 h-full flex-grow bg-[#475424]"> {/* Page background: Dark Olive Green */}
      <div className="bg-[#F5F0E5] p-8 md:p-12 rounded-xl shadow-2xl border-2 border-[#EDB403] max-w-lg w-full"> {/* Card: Cream background, Golden Yellow border */}
        <svg 
            className="w-16 h-16 md:w-20 md:h-20 text-[#EDB403] mx-auto mb-6 animate-pulse" /* Icon: Golden Yellow */
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-3xl md:text-4xl font-bold text-[#475424] mb-4"> {/* Title: Dark Olive Green */}
          Thank You!
        </h2>
        <p className="text-md md:text-lg text-[#1E2229] mb-8"> {/* Main Text: Dark Charcoal */}
          Your feedback have been received. We appreciate you choosing Fire & Froast!
          <br />
          We hope to delight you again soon.
        </p>
        {/* Removed the "You will be redirected..." text */}
      </div>
    </div>
  );
};

export default ThankYouPage;