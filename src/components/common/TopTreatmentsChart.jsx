import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Root Canal', value: 400 },
  { name: 'Dental Death', value: 300 },
  { name: 'Bleaching', value: 300 },
  { name: 'Others', value: 200 },
];
const COLORS = ['#6366f1', '#34d399', '#f59e0b', '#d1d5db'];

const TopTreatmentsChart = () => {
  return (
    <div>
        <h3 className="text-lg font-semibold mb-4">Top Treatments</h3>
        <ResponsiveContainer width="100%" height={150}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};

export default TopTreatmentsChart;