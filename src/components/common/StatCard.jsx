// import React from 'react';

// const StatCard = ({ title, value, change, icon }) => {
//   const isPositive = change.startsWith('+');
//   return (
//     <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between h-full">
//       <div className="flex justify-between items-start">
//         <h3 className="text-sm font-medium text-gray-500">{title}</h3>
//         <div className="text-2xl">{icon}</div>
//       </div>
//       <div>
//         <p className="text-3xl font-bold text-gray-800">{value}</p>
//         <span className={`text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
//           {change}
//         </span>
//       </div>
//       <button className="text-xs text-blue-500 hover:underline mt-2 text-left">View report</button>
//     </div>
//   );
// };

// export default StatCard;
import React from 'react';

export const StatsGrid = ({ stats, onStatClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          onClick={() => stat.clickable && onStatClick(stat.title)}
          className={`cursor-${stat.clickable ? 'pointer' : 'default'} ${stat.bgColor} p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition`}
        >
          <div className={`w-10 h-10 flex items-center justify-center rounded-full ${stat.iconColor} bg-white mb-2`}>
            {stat.icon}
          </div>
          <h4 className="text-sm font-medium text-gray-700">{stat.title}</h4>
          <p className="text-xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
        </div>
      ))}
    </div>
  );
};

