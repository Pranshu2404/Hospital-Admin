import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { name: 'Feb', Revenue: 2400, "Net Profit": 1800 },
  { name: 'Mar', Revenue: 1398, "Net Profit": 2210 },
  { name: 'Apr', Revenue: 9800, "Net Profit": 2290 },
  { name: 'May', Revenue: 3908, "Net Profit": 2000 },
  { name: 'Jun', Revenue: 4800, "Net Profit": 2181 },
  { name: 'Jul', Revenue: 3800, "Net Profit": 2500 },
  { name: 'Aug', Revenue: 4300, "Net Profit": 2100 },
  { name: 'Sep', Revenue: 5100, "Net Profit": 2800 },
  { name: 'Oct', Revenue: 5800, "Net Profit": 3200 },
];

const AppointmentChart = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Appointment</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}/>
          <Legend iconType="circle" />
          <Bar dataKey="Net Profit" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={15} />
          <Bar dataKey="Revenue" fill="#34d399" radius={[4, 4, 0, 0]} barSize={15} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppointmentChart;