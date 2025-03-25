import { ReactNode } from 'react';

interface CardProps {
  children?: ReactNode;
  className?: string;
  venueName?: string;
  imgSrc?: string;
}

export default function Card({ children, className = '', venueName, imgSrc }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      {imgSrc && (
        <img src={imgSrc} alt={venueName} className="w-full h-48 object-cover rounded-lg mb-4" />
      )}
      {venueName && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{venueName}</h3>
      )}
      {children}
    </div>
  );
} 