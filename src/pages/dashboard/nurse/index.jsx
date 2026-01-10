import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { nurseSidebar } from '../../../constants/sidebarItems/nurseSidebar';
import apiClient from '../../../api/apiClient';
import { FaCalendarCheck, FaHeartbeat } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NurseDashboard = () => {
    const [stats, setStats] = useState({
        pendingVitals: 0,
        todayAppointments: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch appointments to calculate basic stats
                const response = await apiClient.get('/appointments');
                const allAppointments = response.data.appointments || response.data || [];

                // Use all appointments for stats
                const relevantAppointments = allAppointments.filter(appt =>
                    appt.status !== 'Cancelled' &&
                    ['Scheduled', 'Confirmed', 'Pending', 'In Progress', 'Completed'].includes(appt.status)
                );

                // Calculate pending vitals (All relevant appointments with no vitals)
                const pendingVitalsCount = relevantAppointments.filter(appt =>
                    !appt.vitals || Object.keys(appt.vitals).length === 0
                ).length;

                setStats({
                    pendingVitals: pendingVitalsCount,
                    todayAppointments: relevantAppointments.length
                });
            } catch (err) {
                console.error("Error fetching dashboard stats", err);
            }
        };

        fetchStats();
    }, []);

    return (
        <Layout sidebarItems={nurseSidebar} role="nurse">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Nurse Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase">Pending Vitals</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.pendingVitals}</h3>
                        </div>
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                            <FaHeartbeat />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 uppercase">Total Appointments</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stats.todayAppointments}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <FaCalendarCheck />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <Link to="/dashboard/nurse/prescriptions" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                            View Appointments
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default NurseDashboard;
