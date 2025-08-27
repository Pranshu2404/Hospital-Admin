import React from 'react';
import { Link } from 'react-router-dom';

const StatCardPharmacy = ({ icon, title, value, change, changeColor, linkTo, onClick }) => {
  // Common JSX for the card's content
  const cardContent = (
    <div className="bg-white rounded-xl shadow-md p-5 h-full flex items-center transition-shadow hover:shadow-lg">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {change && (
          <p className={`text-xs mt-1 font-semibold ${changeColor || 'text-gray-500'}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );

  // Render as a Link if linkTo prop is provided
  if (linkTo) {
    return (
      <Link to={linkTo} className="block transform hover:-translate-y-1 transition-transform duration-300">
        {cardContent}
      </Link>
    );
  }

  // Render as a Button if onClick prop is provided
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left block transform hover:-translate-y-1 transition-transform duration-300"
      >
        {cardContent}
      </button>
    );
  }

  // Otherwise, render as a static div
  return <div>{cardContent}</div>;
};

export default StatCardPharmacy;