import React from 'react';

interface HashtagListProps {
  hashtags: string[];
  className?: string;
}

export const HashtagList: React.FC<HashtagListProps> = ({ 
  hashtags, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {hashtags.map((hashtag) => (
        <button
          key={hashtag}
          className="text-blue-300 text-sm font-medium hover:text-blue-200 transition-colors duration-200"
          onClick={() => {
            // In real app, would filter feed by hashtag
            console.log(`Filter by hashtag: ${hashtag}`);
          }}
        >
          #{hashtag}
        </button>
      ))}
    </div>
  );
};