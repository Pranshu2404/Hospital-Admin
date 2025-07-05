import React, { useState, useEffect } from 'react';
import { Bell, UserPlus, Users, UserCheck, Bed, AlertTriangle, Dot } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Layout from '../Layout';
import { staffSidebar } from '../../constants/sidebarItems/staffSidebar';
import { subDays, subMonths, subYears, isAfter, parse } from 'date-fns';

const statsCardsData = [
    {
        title: 'Total Staff',
        value: '5',
        trend: '+2 from last week',
        icon: <Users className="h-6 w-6 text-gray-500" />,
        color: 'text-blue-500',
    },
    {
        title: 'On Duty',
        value: '3',
        progress: 60,
        description: '60% of total staff',
        icon: <UserCheck className="h-6 w-6 text-gray-500" />,
        color: 'text-green-500',
    },
    {
        title: 'Active Patients',
        value: '38',
        trend: '+5 from yesterday',
        icon: <Bed className="h-6 w-6 text-gray-500" />,
        color: 'text-yellow-500',
    },
    {
        title: 'Critical Alerts',
        value: '2',
        description: 'Requires immediate attention',
        icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
        color: 'text-red-500',
    },
];

// CORRECTED: More realistic data for all time ranges
const patientFlowData = [
    // Data for Yearly View
    { name: '1/15/2025', admissions: 10, discharges: 8 },
    { name: '3/10/2025', admissions: 14, discharges: 12 },
    // Data for Monthly View
    { name: '6/5/2025', admissions: 20, discharges: 18 },
    { name: '6/15/2025', admissions: 18, discharges: 20 },
    // Data for Weekly View (Last 7 Days from July 5, 2025)
    { name: '6/29/2025', admissions: 15, discharges: 19 },
    { name: '6/30/2025', admissions: 22, discharges: 17 },
    { name: '7/1/2025', admissions: 19, discharges: 20 },
    { name: '7/2/2025', admissions: 24, discharges: 21 },
    { name: '7/3/2025', admissions: 21, discharges: 25 },
    { name: '7/4/2025', admissions: 18, discharges: 22 },
    { name: '7/5/2025', admissions: 23, discharges: 19 },
];


const departmentStatusData = [
    { name: 'Emergency', staff: 9, capacity: 12 },
    { name: 'ICU', staff: 5, capacity: 8 },
    { name: 'Cardiology', staff: 6, capacity: 10 },
    { name: 'Pediatrics', staff: 5, capacity: 5 },
];

const recentActivityData = [
    { text: 'Dr. Sarah Johnson started shift', time: '2 min ago', color: 'text-blue-500' },
    { text: 'Patient admitted to ICU', time: '5 min ago', color: 'text-yellow-500' },
    { text: 'Nurse Mike Chen completed rounds', time: '10 min ago', color: 'text-green-500' },
    { text: 'Emergency alert resolved', time: '15 min ago', color: 'text-green-500' },
];

// --- Components --- //

const StatCard = ({ title, value, trend, progress, description, icon, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-600">{title}</span>
            {icon}
        </div>
        <div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
            {progress !== undefined && (
                <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                </div>
            )}
            {description && progress === undefined && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
    </div>
);

const PatientFlowChart = () => {
    const [timeRange, setTimeRange] = useState('weekly');
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const now = new Date();
        let startDate;

        if (timeRange === 'monthly') {
            startDate = subMonths(now, 1);
        } else if (timeRange === 'yearly') {
            startDate = subYears(now, 1);
        } else {
            startDate = subDays(now, 7);
        }

        const data = patientFlowData.filter(d => isAfter(parse(d.name, 'M/d/yyyy', new Date()), startDate));
        setFilteredData(data);

    }, [timeRange]);

    const getTitle = () => {
        if (timeRange === 'monthly') return 'Patient Flow (Last Month)';
        if (timeRange === 'yearly') return 'Patient Flow (Last Year)';
        return 'Patient Flow (Last 7 Days)';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-semibold text-lg">{getTitle()}</h3>
                    <p className="text-sm text-gray-500">Daily patient admissions and discharges</p>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => setTimeRange('weekly')} className={`px-3 py-1 text-sm rounded-md ${timeRange === 'weekly' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>Weekly</button>
                    <button onClick={() => setTimeRange('monthly')} className={`px-3 py-1 text-sm rounded-md ${timeRange === 'monthly' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>Monthly</button>
                    <button onClick={() => setTimeRange('yearly')} className={`px-3 py-1 text-sm rounded-md ${timeRange === 'yearly' ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>Yearly</button>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: "14px" }} />
                    <Line type="monotone" dataKey="admissions" stroke="#3b82f6" strokeWidth={2} name="Admissions" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="discharges" stroke="#ef4444" strokeWidth={2} name="Discharges" dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const DepartmentStatus = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg">Department Status</h3>
        <p className="text-sm text-gray-500 mb-6">Current capacity and staff allocation</p>
        <div className="space-y-4">
            {departmentStatusData.map((dept) => (
                <div key={dept.name}>
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                            <Dot className="text-teal-500 -ml-3" size={32} />
                            <span className="text-sm font-medium">{dept.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{dept.staff} staff</span>
                    </div>
                    <div className="w-full bg-teal-100 rounded-full h-2.5">
                        <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${(dept.staff / dept.capacity) * 100}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const RecentActivity = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
        <h3 className="font-semibold text-lg">Recent Activity</h3>
        <p className="text-sm text-gray-500 mb-4">Latest updates and changes</p>
        <ul className="space-y-4">
            {recentActivityData.map((activity, index) => (
                <li key={index} className="flex items-start">
                    <Dot className={`${activity.color.replace('blue', 'teal').replace('yellow', 'teal').replace('green', 'teal')} -ml-3 mt-[-4px]`} size={32} />
                    <div>
                        <p className="text-sm">{activity.text}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

const StaffDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    return (
        <Layout sidebarItems={staffSidebar} section="Staff">
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <header className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Staff Management Dashboard</h1>
                            <p className="text-sm text-gray-500">{formattedDate} &middot; {formattedTime}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-50">
                                <Bell className="h-4 w-4 mr-2" />
                                Alerts (2)
                            </button>
                            <button className="flex items-center bg-teal-600 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-teal-500">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Staff
                            </button>
                        </div>
                    </header>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {statsCardsData.map((card, index) => (
                            <StatCard key={index} {...card} />
                        ))}
                    </div>

                    {/* Main Content (Overview) */}
                    <main>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <PatientFlowChart />
                            </div>
                            <div>
                                <DepartmentStatus />
                            </div>
                        </div>
                        <RecentActivity />
                    </main>
                </div>
            </div>
        </Layout>
    );
};

export default StaffDashboard;