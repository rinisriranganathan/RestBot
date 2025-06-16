
import React, { useState } from 'react';

interface StarRatingProps {
  rating: number; // Current rating (0-5)
  onRatingChange: (rating: number) => void;
  starSize?: string; // e.g., 'h-6 w-6'
  starColor?: string; // e.g., 'text-yellow-400'
  inactiveStarColor?: string; // e.g., 'text-gray-300'
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  starSize = 'h-6 w-6 sm:h-7 sm:w-7', // Default size
  starColor = 'text-[#EDB403]', // Golden Yellow
  inactiveStarColor = 'text-[#BBD69D]', // Pale Green
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`focus:outline-none transition-colors duration-150 ${starSize}`}
          onClick={() => onRatingChange(rating === star ? 0 : star)} // Updated onClick logic
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          aria-label={`Rate ${star} out of 5 stars. Current rating: ${rating} stars. ${rating === star ? "Click to remove rating." : `Click to rate ${star} stars.`}`}
        >
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            className={`
              ${(hoverRating || rating) >= star ? starColor : inactiveStarColor}
              transform hover:scale-110 transition-transform
            `}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.24 9.393c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
          </svg>
        </button>
      ))}
    </div>
  );
};
