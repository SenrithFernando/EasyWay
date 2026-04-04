import React from 'react';
import { StarIcon } from 'lucide-react';

export function RatingStars({
  value = 0,
  onChange,
  interactive = false,
  size = 20,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;

        if (!interactive) {
          return (
            <StarIcon
              key={star}
              size={size}
              className={filled ? 'fill-warm-500 text-warm-500' : 'text-surface-200'}
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="transition-transform hover:scale-110"
          >
            <StarIcon
              size={size}
              className={filled ? 'fill-warm-500 text-warm-500' : 'text-surface-200'}
            />
          </button>
        );
      })}
    </div>
  );
}
