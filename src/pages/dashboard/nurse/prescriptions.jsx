import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { nurseSidebar } from '../../../constants/sidebarItems/nurseSidebar';
import apiClient from '../../../api/apiClient';
import { FaSearch, FaHeartbeat, FaCalendarCheck } from 'react-icons/fa';

const NurseAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Default Vitals (Normal Range / Standard placeholders)
    const defaultVitals = {
        bp: '120/80',
        weight: '70',
        pulse: '72',
        spo2: '98',
        temperature: '98.6',
        respiratory_rate: '16',
        random_blood_sugar: '100',
        height: '170'
    };

    // Vitals Form State
    const [vitals, setVitals] = useState(defaultVitals);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            // Fetch all appointments. Optimization: Fetch only today's or filtered by 'Scheduled' status if supported.
            // Using existing getAllAppointments endpoint, filtering client-side for now for simplicity.
            const response = await apiClient.get('/appointments');
            const allAppointments = response.data.appointments || response.data || [];

            // Filter for relevant appointments (e.g., Scheduled, Checked In)
            // And Sort by date/time
            // Filter: show appointments that are NOT cancelled.
            // Show all relevant active/completed appointments regardless of date.
            const filtered = allAppointments.filter(app => {
                return app.status !== 'Cancelled' &&
                    ['Scheduled', 'Confirmed', 'Pending', 'In Progress', 'Completed'].includes(app.status);
            });

            // For each appointment, we might need to know if vitals are already filled.
            // The getAllAppointments endpoint currently doesn't populate 'vitals' automatically (I didn't update that one).
            // I should update the backend getAllAppointments to include vitals status, OR I can just default to "Pending" 
            // and relying on the "Update" action to show current values.
            // Or I can fetch vitals for these appointments in a batch or individually?
            // BETTER: Update getAllAppointments in backend to also fetch vitals. 
            // Wait, I updated getAppointmentById. I didn't update getAppointments... 
            // But the user said "vitals will be taken by nurse then these vitals will show to doctor".
            // For the dashboard list, showing "Filled" vs "Pending" is useful.
            // I'll update the backend getAllAppointments to include vitals info next.
            // For now, I'll proceed with frontend assumption that backend WILL send vitals.

            setAppointments(filtered);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateClick = (appointment) => {
        setSelectedAppointment(appointment);
        // Pre-fill if vitals exist, otherwise use defaults
        setVitals({
            bp: appointment.vitals?.bp || defaultVitals.bp,
            weight: appointment.vitals?.weight || defaultVitals.weight,
            pulse: appointment.vitals?.pulse || defaultVitals.pulse,
            spo2: appointment.vitals?.spo2 || defaultVitals.spo2,
            temperature: appointment.vitals?.temperature || defaultVitals.temperature,
            respiratory_rate: appointment.vitals?.respiratory_rate || defaultVitals.respiratory_rate,
            random_blood_sugar: appointment.vitals?.random_blood_sugar || defaultVitals.random_blood_sugar,
            height: appointment.vitals?.height || defaultVitals.height
        });
    };

    const handleVitalsChange = (e) => {
        setVitals({ ...vitals, [e.target.name]: e.target.value });
    };

    const submitVitals = async (e) => {
        e.preventDefault();
        try {
            await apiClient.put(`/appointments/${selectedAppointment._id}/vitals`, {
                ...vitals
            });

            alert('Vitals updated successfully!');
            setSelectedAppointment(null);
            fetchAppointments(); // Refresh list to update status
        } catch (err) {
            console.error('Error updating vitals:', err);
            alert('Failed to update vitals.');
        }
    };

    const filteredList = appointments.filter(a =>
        (a.patient_id?.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (a.patient_id?.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (a.doctor_id?.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <Layout sidebarItems={nurseSidebar} role="nurse">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Nurse Appointments (Vitals Check)</h1>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search patient or doctor..."
                            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                            <tr>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Doctor</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Vitals Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8">Loading...</td></tr>
                            ) : filteredList.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-slate-400">No scheduled appointments for today found.</td></tr>
                            ) : (
                                filteredList.map(a => (
                                    <tr key={a._id} className="hover:bg-slate-50 transition">
                                        <td className="px-6 py-4">
                                            {a.start_time ?
                                                (() => {
                                                    // Parse the ISO string
                                                    const date = new Date(a.start_time);

                                                    // Get the UTC hours/minutes
                                                    const hours = date.getUTCHours();
                                                    const minutes = date.getUTCMinutes();

                                                    // Create a new date with these hours/minutes in local timezone
                                                    const displayDate = new Date();
                                                    displayDate.setHours(hours, minutes, 0, 0);

                                                    return displayDate.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    });
                                                })() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {a.patient_id?.first_name} {a.patient_id?.last_name}
                                        </td>
                                        <td className="px-6 py-4">Dr. {a.doctor_id?.firstName} {a.doctor_id?.lastName}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${a.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                                                }`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {a.vitals ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Filled</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleUpdateClick(a)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition font-medium"
                                            >
                                                <FaHeartbeat /> Update Vitals
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vitals Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Update Vitals</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Patient: {selectedAppointment.patient_id?.first_name} {selectedAppointment.patient_id?.last_name}
                        </p>

                        <form onSubmit={submitVitals} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Height (cm)</label>
                                    <input
                                        type="text" name="height" value={vitals.height} onChange={handleVitalsChange}
                                        placeholder="e.g. 170"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Weight (kg)</label>
                                    <input
                                        type="text" name="weight" value={vitals.weight} onChange={handleVitalsChange}
                                        placeholder="e.g. 70"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Blood Pressure</label>
                                    <input
                                        type="text" name="bp" value={vitals.bp} onChange={handleVitalsChange}
                                        placeholder="e.g. 120/80"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pulse (bpm)</label>
                                    <input
                                        type="text" name="pulse" value={vitals.pulse} onChange={handleVitalsChange}
                                        placeholder="e.g. 72"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SPO2 (%)</label>
                                    <input
                                        type="text" name="spo2" value={vitals.spo2} onChange={handleVitalsChange}
                                        placeholder="e.g. 98"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Temperature (°F)</label>
                                    <input
                                        type="text" name="temperature" value={vitals.temperature} onChange={handleVitalsChange}
                                        placeholder="e.g. 98.6"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RR (breaths/min)</label>
                                    <input
                                        type="text" name="respiratory_rate" value={vitals.respiratory_rate} onChange={handleVitalsChange}
                                        placeholder="e.g. 16"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RBS (mg/dL)</label>
                                    <input
                                        type="text" name="random_blood_sugar" value={vitals.random_blood_sugar} onChange={handleVitalsChange}
                                        placeholder="e.g. 100"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setSelectedAppointment(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                                >
                                    Save Vitals
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default NurseAppointments;
