export const StatCard = ({ title, value, change, changeType, icon, bgColor = "bg-blue-50", iconColor = "text-blue-600", onClick }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-teal-600'}`}>
          <span className="inline-flex items-center">
            {changeType === 'positive' ? (
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            ) : changeType === 'negative' ? (
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            ) : (
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {change}
          </span>
        </p>
      </div>
      <div className={`p-3 ${bgColor} rounded-lg`}>
        <div className={`h-8 w-8 ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

export const StatsGrid = ({ stats, onStatClick }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {stats.map((stat, index) => (
      <StatCard key={index} {...stat} onClick={() => onStatClick(stat)} />
    ))}
  </div>
);

