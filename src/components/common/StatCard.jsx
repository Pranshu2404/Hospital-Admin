import React from 'react';

const StatCard = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="text-2xl">{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <span className={`text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
      </div>
      <button className="text-xs text-blue-500 hover:underline mt-2 text-left">View report</button>
    </div>
  );
};

export default StatCard;