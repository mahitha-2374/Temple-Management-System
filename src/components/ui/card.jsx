
import React from 'react';

// Card component
export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={`rounded-lg border bg-white shadow-sm ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

// CardHeader component
export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={`px-4 py-2 border-b ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

// CardTitle component
export const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3
      className={`text-lg font-semibold ${className || ''}`}
      {...props}
    >
      {children}
    </h3>
  );
};

// CardContent component
export const CardContent = ({ children, className, ...props }) => {
  return (
    <div
      className={`px-4 py-2 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};