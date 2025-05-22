import React from 'react';

export const Button = ({ children, className, ...props }) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        px-4 py-2
        text-sm font-medium
        rounded-md
        bg-blue-600
        text-white
        hover:bg-blue-700
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </button>
  );
};