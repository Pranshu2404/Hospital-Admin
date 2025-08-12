import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, title, value, change, changeColor = 'text-gray-500', linkTo, onClick }) => {
  const content = (
    <div className="bg-white rounded-xl shadow-md p-5 h-full">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mr-4">
          {icon}
        </div>
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
        </div>
      </div>
      <div className={`text-xs font-medium mt-2 ${changeColor}`}>{change}</div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left w-full transform hover:-translate-y-1 transition-transform duration-300">
        {content}
      </button>
    );
  }

  if (linkTo) {
    return (
      <Link to={linkTo} className="block transform hover:-translate-y-1 transition-transform duration-300">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
};

export default StatCard;