import React, { useState, useEffect } from 'react';
// Aliased BarChart icon to avoid naming conflict with recharts component
import { Users, Bed, Dot, User as UserIcon, BarChart as BarChartIcon, LineChart as LineChartIcon, ArrowUp, ArrowDown, Clock, X, ChevronDown, Edit, Save, Mail, Phone, MapPin, Calendar, Droplet } from 'lucide-react';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, LineChart, BarChart } from 'recharts';
import Layout from '../Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
// MODIFIED: Added more date-fns functions for time range filtering and formatting
import { format, subDays, parseISO, subMonths, subYears, formatDistanceToNow } from 'date-fns';

// --- Reusable Components --- //

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color.replace('text-', 'bg-').replace('500', '100')}`}>
            {React.cloneElement(icon, { className: `h-6 w-6 ${color}` })}
        </div>
        <div>
            <span className="text-sm font-medium text-gray-600">{title}</span>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
    </div>
);

// --- Chart & List Components --- //

const StaffDistributionChart = ({ staff, departments }) => {
    const chartData = departments.map(dept => ({
        name: dept.name,
        staffCount: staff.filter(s => s.department === dept.name).length,
    }));

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full">
            <h3 className="font-semibold text-lg flex items-center"><BarChartIcon className="mr-2" />Staff by Department</h3>
            <p className="text-sm text-gray-500 mb-4">Distribution of staff across departments.</p>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-25} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="staffCount" fill="#14b8a6" name="Staff Members" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const PatientRegistrationChart = ({ patients }) => {
    const [timeRange, setTimeRange] = useState('weekly');
    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState({ total: 0, change: 0 });

    useEffect(() => {
        const processData = () => {
            const now = new Date();
            let startDate, prevStartDate, periodLabelFormat;

            if (timeRange === 'weekly') {
                startDate = subDays(now, 7);
                prevStartDate = subDays(now, 14);
                periodLabelFormat = 'MMM dd';
            } else if (timeRange === 'monthly') {
                startDate = subMonths(now, 1);
                prevStartDate = subMonths(now, 2);
                periodLabelFormat = 'MMM dd';
            } else { // yearly
                startDate = subYears(now, 1);
                prevStartDate = subYears(now, 2);
                periodLabelFormat = 'MMM yyyy';
            }

            const allPatients = patients.map(p => ({ ...p, registeredDate: p.registered_at ? parseISO(p.registered_at) : null }));
            const currentPeriodPatients = allPatients.filter(p => p.registeredDate && p.registeredDate >= startDate);
            const previousPeriodPatients = allPatients.filter(p => p.registeredDate && p.registeredDate >= prevStartDate && p.registeredDate < startDate);

            const totalCurrent = currentPeriodPatients.length;
            const totalPrevious = previousPeriodPatients.length;
            const change = totalPrevious > 0 ? ((totalCurrent - totalPrevious) / totalPrevious) * 100 : totalCurrent > 0 ? 100 : 0;
            setStats({ total: totalCurrent, change: change });
            
            const registrationsByDay = currentPeriodPatients.reduce((acc, p) => {
                const day = format(p.registeredDate, periodLabelFormat);
                acc[day] = (acc[day] || 0) + 1;
                return acc;
            }, {});

            const formattedData = Object.keys(registrationsByDay).map(day => ({
                date: day,
                registrations: registrationsByDay[day],
            })).sort((a,b) => new Date(a.date) - new Date(b.date));
            
            setChartData(formattedData);
        };

        if (patients.length > 0) {
            processData();
        }
    }, [patients, timeRange]);

    const getTitle = () => {
        if (timeRange === 'monthly') return 'Last Month';
        if (timeRange === 'yearly') return 'Last Year';
        return 'Last 7 Days';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full">
            <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                    <h3 className="font-semibold text-lg flex items-center"><LineChartIcon className="mr-2" />New Patient Registrations</h3>
                    <p className="text-sm text-gray-500">Registrations for the {getTitle()}</p>
                </div>
                <div className="flex space-x-1 border border-gray-200 rounded-md p-1">
                    <button onClick={() => setTimeRange('weekly')} className={`px-3 py-1 text-sm rounded ${timeRange === 'weekly' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600'}`}>Weekly</button>
                    <button onClick={() => setTimeRange('monthly')} className={`px-3 py-1 text-sm rounded ${timeRange === 'monthly' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600'}`}>Monthly</button>
                    <button onClick={() => setTimeRange('yearly')} className={`px-3 py-1 text-sm rounded ${timeRange === 'yearly' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600'}`}>Yearly</button>
                </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
                <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
                <div className={`flex items-center text-sm px-2 py-1 rounded-full ${stats.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {stats.change >= 0 ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
                    {stats.change.toFixed(1)}% vs previous period
                </div>
            </div>

             <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={2} name="New Patients" dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const RecentAppointments = ({ appointments }) => {
    const getStatusBadge = (status) => {
        const statusClasses = {
          Pending: 'bg-yellow-100 text-yellow-800',
          Confirmed: 'bg-green-100 text-green-800',
          Cancelled: 'bg-red-100 text-red-800',
        };
        return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
            <h3 className="font-semibold text-lg flex items-center"><Clock className="mr-2" />Recent Appointments</h3>
            <p className="text-sm text-gray-500 mb-4">A list of the latest scheduled appointments.</p>
            <div className="space-y-2">
                {appointments.length > 0 ? appointments.map((appt) => (
                    <div key={appt.id} className="p-3 rounded-lg border border-gray-100 flex flex-wrap justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium text-sm">{appt.initials}</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{appt.patientName}</p>
                                <p className="text-sm text-gray-500">{appt.doctor}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{appt.time}</p>
                            <span className={getStatusBadge(appt.status)}>{appt.status}</span>
                        </div>
                    </div>
                )) : <p className="text-gray-500 text-center py-4">No recent appointments found.</p>}
            </div>
        </div>
    );
};

const PatientList = ({ patients, onPatientClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center"><UserIcon className="mr-2" />All Registered Patients ({patients.length})</h3>
                <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen mt-4' : 'max-h-0'}`}>
                <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
                    {patients.map((p) => (
                        <div key={p._id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{p.first_name} {p.last_name}</p>
                                <p className="text-sm text-gray-500">Patient ID: {p.patientId}</p>
                                {/* <div className="flex space-x-4 mt-1">
                                    <span className="text- text-gray-600">Gender: {p.gender}</span>
                                    <span className="text-xs text-gray-600">Blood: {p.blood_group}</span>
                                </div> */}
                            </div>
                            <button
                                onClick={() => onPatientClick(p)}
                                className="px-3 py-1 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700 transition"
                            >
                                View
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// MODIFIED: This component has an improved UI and handles editing state.
const PatientDetailModal = ({ patient, onClose, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (patient) {
            setFormData({
                ...patient,
                dob: format(parseISO(patient.dob), 'yyyy-MM-dd')
            });
            // Reset editing state when a new patient is selected
            setIsEditing(false);
        }
    }, [patient]);

    if (!patient || !formData) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        setIsEditing(false);
    };

    // A small component for rendering each piece of data, either as text or an input field.
    const DetailRow = ({ label, name, value, isEditing, type = 'text' }) => (
        <div className="grid grid-cols-3 gap-2 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-600 col-span-1">{label}</p>
            {isEditing ? (
                <input
                    type={type}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleInputChange}
                    className="col-span-2 text-sm p-2 border bg-gray-50 rounded-md focus:ring-2 focus:ring-teal-500 outline-none"
                />
            ) : (
                <p className="text-sm text-gray-800 col-span-2">{value}</p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
                {/* Modal Header */}
                <div className="p-6 flex items-center border-b relative">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-teal-600">
                            {(formData.first_name?.[0] || '') + (formData.last_name?.[0] || '')}
                        </span>
                    </div>
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold text-gray-800">{formData.first_name} {formData.last_name}</h2>
                        <p className="text-sm text-gray-500">{formData.patientId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Personal Details</h3>
                            <DetailRow label="Gender" name="gender" value={formData.gender} isEditing={isEditing} />
                            <DetailRow label="Date of Birth" name="dob" value={format(parseISO(patient.dob), 'dd MMM yyyy')} isEditing={isEditing} type="date" />
                            <DetailRow label="Blood Group" name="blood_group" value={formData.blood_group} isEditing={isEditing} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2 mt-4">Contact Information</h3>
                            <DetailRow label="Email" name="email" value={formData.email} isEditing={isEditing} />
                            <DetailRow label="Phone" name="phone" value={formData.phone} isEditing={isEditing} />
                            <DetailRow label="Address" name="address" value={`${formData.address}, ${formData.city}, ${formData.state} - ${formData.zipCode}`} isEditing={isEditing} />
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-teal-400 flex items-center">
                                <Save size={16} className="mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 flex items-center">
                            <Edit size={16} className="mr-2" /> Edit Patient
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main Dashboard Component --- //

const StaffDashboard = () => {
    const [staff, setStaff] = useState([]);
    const [patients, setPatients] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleSavePatient = async (updatedPatient) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/patients/${updatedPatient._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPatient),
            });
            if (!response.ok) {
                throw new Error('Failed to save patient data.');
            }
            const savedPatient = await response.json();
            setPatients(prev => prev.map(p => p._id === savedPatient._id ? savedPatient : p));
            setSelectedPatient(null);
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const [staffRes, patientRes, departmentRes, appointmentRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/staff`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/patients`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/departments`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`)
                ]);

                if (!staffRes.ok || !patientRes.ok || !departmentRes.ok || !appointmentRes.ok) {
                    throw new Error('Failed to fetch data. Please check API endpoints and server status.');
                }

                const staffData = await staffRes.json();
                const patientData = await patientRes.json();
                const departmentData = await departmentRes.json();
                const appointmentData = await appointmentRes.json();
                
                setStaff(staffData);
                setPatients(patientData);
                setDepartments(departmentData);

                const sortedAppointments = [...appointmentData]
                    .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
                    .slice(0, 5)
                    .map((a) => ({
                        id: a._id,
                        patientName: a.patient_id?.first_name ? `${a.patient_id.first_name} ${a.patient_id.last_name}` : 'Unknown Patient',
                        time: a.appointment_date ? format(parseISO(a.appointment_date), 'hh:mm a') : 'N/A',
                        doctor: a.doctor_id?.firstName ? `Dr. ${a.doctor_id.firstName}` : 'Dr. Unknown',
                        status: a.status || 'Scheduled',
                        initials: (a.patient_id?.first_name?.[0] || '') + (a.patient_id?.last_name?.[0] || ''),
                    }));
                setRecentAppointments(sortedAppointments);

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err.message);
                setStaff([]);
                setPatients([]);
                setDepartments([]);
                setRecentAppointments([]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <Layout sidebarItems={staffSidebar} section="Staff">
            <PatientDetailModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} onSave={handleSavePatient} />
            <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* <header className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Staff Dashboard</h1>
                        <p className="text-sm text-gray-500">Overview of hospital staff and patient data.</p>
                    </header> */}

                    {loading && <div className="text-center py-10 text-gray-500">Loading dashboard data...</div>}
                    
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">{error}</div>}

                    {!loading && !error && (
                        <main>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                <StatCard title="Total Staff" value={staff.length} icon={<Users />} color="text-blue-500" />
                                <StatCard title="Total Patients" value={patients.length} icon={<Bed />} color="text-yellow-500" />
                                <StatCard title="Total Departments" value={departments.length} icon={<Dot size={32} />} color="text-green-500" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                               <div className="lg:col-span-3">
                                  <PatientRegistrationChart patients={patients} />
                               </div>
                               <RecentAppointments appointments={recentAppointments} />
                               <div>
                                  <StaffDistributionChart staff={staff} departments={departments} />
                               </div>
                            </div>

                            <div className="grid grid-cols-1">
                                <PatientList patients={patients} onPatientClick={setSelectedPatient} />
                            </div>
                        </main>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default StaffDashboard;
