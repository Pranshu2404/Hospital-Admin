import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
    Users, Bed, User as UserIcon, BarChart as BarChartIcon,
    LineChart as LineChartIcon, ArrowUp, ArrowDown, Clock,
    X, ChevronDown, Edit, Save, Search, Filter, Calendar as CalendarIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, Line, LineChart, BarChart, Area, AreaChart
} from 'recharts';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Layout from '../Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import AppointmentSlipModal from '@/components/appointments/AppointmentSlipModal';
import { format, subDays, parseISO, subMonths, subYears, isSameDay } from 'date-fns';
import { FaMoneyBill, FaUser } from 'react-icons/fa';

const localizer = momentLocalizer(moment);

// --- Custom Calendar Styles ---
const calendarStyles = `
  .rbc-calendar { font-family: inherit; color: #475569; border: none; }
  .rbc-header { padding: 12px; font-weight: 600; color: #0f766e; border-bottom: 2px solid #f1f5f9; background: #f0fdfa; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
  .rbc-month-view { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white; }
  .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9; }
  .rbc-off-range-bg { background: #f8fafc; }
  .rbc-today { background-color: #f0fdfa; }
  .rbc-event { border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 2px 5px; font-size: 0.75rem; border: none; }
  .rbc-toolbar { margin-bottom: 16px; }
  .rbc-toolbar button { border: 1px solid #e2e8f0; color: #64748b; font-weight: 500; font-size: 0.875rem; border-radius: 6px; }
  .rbc-toolbar button.rbc-active { background-color: #0d9488; color: white; border-color: #0d9488; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
  .rbc-toolbar button:hover { background-color: #f1f5f9; color: #0f172a; }
`;

// --- Helper Functions ---
const formatStoredTime = (utcTimeString) => {
    if (!utcTimeString) return 'N/A';

    try {
        const date = new Date(utcTimeString);
        // Extract UTC hours and minutes
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();

        // Format as 12-hour time
        const hour12 = hours % 12 || 12;
        const ampm = hours >= 12 ? 'PM' : 'AM';

        return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Invalid Time';
    }
};

const formatStoredDate = (utcTimeString) => {
    if (!utcTimeString) return '';

    try {
        const date = new Date(utcTimeString);
        return date.toLocaleDateString([], {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return '';
    }
};

const getAppointmentStartDate = (appt) => {
    if (!appt.start_time) return new Date(appt.appointment_date);

    try {
        const date = new Date(appt.start_time);
        // Extract UTC components
        const utcHours = date.getUTCHours();
        const utcMinutes = date.getUTCMinutes();

        // Create a new date with these components (treated as local time)
        const localDate = new Date(appt.appointment_date || date);
        localDate.setHours(utcHours, utcMinutes, 0, 0);

        return localDate;
    } catch (error) {
        return new Date(appt.appointment_date);
    }
};

const getAppointmentEndDate = (appt) => {
    if (!appt.end_time) {
        const start = getAppointmentStartDate(appt);
        return new Date(start.getTime() + (appt.duration || 30) * 60000);
    }

    try {
        const date = new Date(appt.end_time);
        // Extract UTC components
        const utcHours = date.getUTCHours();
        const utcMinutes = date.getUTCMinutes();

        // Create a new date with these components (treated as local time)
        const startDate = getAppointmentStartDate(appt);
        const endDate = new Date(startDate);
        endDate.setHours(utcHours, utcMinutes, 0, 0);

        return endDate;
    } catch (error) {
        const start = getAppointmentStartDate(appt);
        return new Date(start.getTime() + (appt.duration || 30) * 60000);
    }
};

// --- Reusable UI Components --- //

const StatCard = ({ title, value, icon, color, onClick }) => (
    <div
        onClick={onClick}
        className={`
      relative bg-white
      p-4 rounded-xl
      border border-slate-100
      shadow-sm
      transition-all duration-300
      hover:shadow-lg hover:-translate-y-0.5
      group
      ${onClick ? 'cursor-pointer' : ''}
    `}
    >
        {/* Top gradient accent */}
        <div className={`absolute inset-x-0 top-0 h-1 rounded-t-xl ${color.bg}`} />

        <div className="flex items-center justify-between">
            {/* Title */}
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {title}
            </p>

            {/* Icon */}
            <div
                className={`
          flex items-center justify-center
          w-9 h-9 rounded-lg
          ${color.bg} ${color.text}
          transition-transform duration-300
          group-hover:scale-110
        `}
            >
                {React.cloneElement(icon, { size: 18 })}
            </div>
        </div>

        {/* Value */}
        <div className="mt-3 flex items-end justify-between">
            <h3 className="text-2xl font-bold text-slate-800 leading-none">
                {value}
            </h3>
        </div>
    </div>
);


// --- Chart Components --- //

const StaffDistributionChart = ({ staff, departments }) => {
    const chartData = departments.map(dept => ({
        name: dept.name,
        count: staff.filter(s => s.department === dept.name).length,
    })).sort((a, b) => b.count - a.count);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Staff Distribution</h3>
                    <p className="text-sm text-slate-500">Headcount by department</p>
                </div>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <BarChartIcon size={20} />
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="90%" height="80%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
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
            let startDate, prevStartDate, dateFormat;

            if (timeRange === 'weekly') {
                startDate = subDays(now, 7);
                prevStartDate = subDays(now, 14);
                dateFormat = 'EEE'; // Mon, Tue
            } else if (timeRange === 'monthly') {
                startDate = subMonths(now, 1);
                prevStartDate = subMonths(now, 2);
                dateFormat = 'MMM dd';
            } else {
                startDate = subYears(now, 1);
                prevStartDate = subYears(now, 2);
                dateFormat = 'MMM yyyy';
            }

            const allPatients = patients.map(p => ({ ...p, regDate: p.registered_at ? parseISO(p.registered_at) : new Date() }));
            const current = allPatients.filter(p => p.regDate >= startDate);
            const previous = allPatients.filter(p => p.regDate >= prevStartDate && p.regDate < startDate);

            // Calculate trends
            const change = previous.length > 0 ? ((current.length - previous.length) / previous.length) * 100 : 0;
            setStats({ total: current.length, change: parseFloat(change.toFixed(1)) });

            // Group by date for chart
            const grouped = current.reduce((acc, p) => {
                const label = format(p.regDate, dateFormat);
                acc[label] = (acc[label] || 0) + 1;
                return acc;
            }, {});

            const data = Object.keys(grouped).map(label => ({
                name: label,
                value: grouped[label]
            }));

            setChartData(data);
        };

        if (patients.length > 0) processData();
    }, [patients, timeRange]);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Patient Growth</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-slate-800">{stats.total}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stats.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {stats.change >= 0 ? '+' : ''}{stats.change}%
                        </span>
                        <span className="text-xs text-slate-400">vs previous period</span>
                    </div>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                    {['weekly', 'monthly', 'yearly'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-2 py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${timeRange === range ? 'bg-white text-teal-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorPatients)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// --- List Components --- //

const RecentAppointments = ({ appointments }) => {
    // Helper to extract appointment details
    const getApptDetails = (appt) => {
        const patientName = appt.patient_id?.first_name
            ? `${appt.patient_id.first_name} ${appt.patient_id.last_name}`
            : 'Unknown Patient';
        const doctorName = appt.doctor_id?.firstName ? `Dr. ${appt.doctor_id.firstName}` : 'Doctor';
        const time = formatStoredTime(appt.start_time);
        const date = formatStoredDate(appt.start_time);

        return {
            patientName,
            doctorName,
            time,
            date,
            type: appt.type || 'Visit',
            status: appt.status || 'Scheduled'
        };
    };

    const statusColors = {
        'Scheduled': 'bg-blue-50 text-blue-700',
        'Completed': 'bg-green-50 text-green-700',
        'Cancelled': 'bg-red-50 text-red-700',
        'In Progress': 'bg-amber-50 text-amber-700'
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Recent Activity</h3>
                    <p className="text-sm text-slate-500">Latest scheduled appointments</p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Clock size={20} />
                </div>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 max-h-[400px] pr-2 custom-scrollbar">
                {appointments.length > 0 ? appointments.slice(0, 6).map((appt) => {
                    const { patientName, doctorName, time, date, type, status } = getApptDetails(appt);
                    return (
                        <div key={appt._id} className="flex items-center p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm mr-3 group-hover:bg-white group-hover:shadow-sm">
                                {patientName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 text-sm truncate">{patientName}</p>
                                <p className="text-xs text-slate-500 truncate">{doctorName} • {type}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-700">{time}</p>
                                <p className="text-[10px] text-gray-500">{date}</p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-600'}`}>
                                    {status}
                                </span>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-8 text-slate-400">
                        <CalendarIcon size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent appointments</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const PatientList = ({ patients, onPatientClick }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = patients.filter(p =>
    (p.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm))
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Patient Directory</h3>
                    <p className="text-sm text-slate-500">Total registered: {patients.length}</p>
                </div>
                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                    <Users size={20} />
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar space-y-2">
                {filteredPatients.length > 0 ? filteredPatients.slice(0, 100).map((p) => (
                    <div key={p._id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100 cursor-pointer" onClick={() => onPatientClick(p)}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                                {p.first_name?.[0]}{p.last_name?.[0]}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{p.first_name} {p.last_name}</p>
                                <p className="text-xs text-slate-500">{p.phone || 'No phone'} • {p.gender || 'N/A'}</p>
                            </div>
                        </div>
                        <button className="text-xs font-semibold text-teal-600 hover:bg-teal-50 px-3 py-1.5 rounded-md transition-colors">
                            Details
                        </button>
                    </div>
                )) : (
                    <p className="text-center text-sm text-slate-400 py-4">No patients found</p>
                )}
            </div>
        </div>
    );
};

// --- Modal Component --- //

const PatientDetailModal = ({ patient, onClose, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (patient) {
            setFormData({
                ...patient,
                dob: patient.dob ? format(parseISO(patient.dob), 'yyyy-MM-dd') : ''
            });
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
    };

    const Field = ({ label, name, type = "text", full = false }) => (
        <div className={`${full ? 'col-span-2' : ''}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{label}</label>
            {isEditing ? (
                <input
                    type={type}
                    name={name}
                    value={formData[name] || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                />
            ) : (
                <p className="text-sm font-medium text-slate-800 p-2 bg-slate-50 rounded-lg border border-transparent">
                    {formData[name] || <span className="text-slate-400 italic">Not set</span>}
                </p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-md">
                            {formData.first_name?.[0]}{formData.last_name?.[0]}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">{formData.first_name} {formData.last_name}</h2>
                            <p className="text-xs text-slate-500 font-medium">Patient ID: {formData.patientId || 'NEW'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="col-span-2 pb-2 mb-2 border-b border-slate-100 text-teal-700 font-bold text-sm flex items-center gap-2">
                            <UserIcon size={16} /> Personal Information
                        </div>
                        <Field label="First Name" name="first_name" />
                        <Field label="Last Name" name="last_name" />
                        <Field label="Date of Birth" name="dob" type="date" />
                        <Field label="Gender" name="gender" />
                        <Field label="Blood Group" name="blood_group" />

                        <div className="col-span-2 pb-2 mb-2 mt-4 border-b border-slate-100 text-teal-700 font-bold text-sm flex items-center gap-2">
                            <Users size={16} /> Contact Details
                        </div>
                        <Field label="Phone Number" name="phone" />
                        <Field label="Email Address" name="email" />
                        {/* <Field label="Full Address" name="address" full /> */}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Cancel</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 text-sm font-bold text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm flex items-center gap-2">
                                {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-6 py-2 text-sm font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-700 shadow-sm flex items-center gap-2">
                            <Edit size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard Component --- //

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [patients, setPatients] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [selectedCalendarAppt, setSelectedCalendarAppt] = useState(null);
    const [isApptModalOpen, setIsApptModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('month');
    const [hospitalInfo, setHospitalInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [todayCollection, setTodayCollection] = useState({ paid: 0, pending: 0 });
    const [totalCollection, setTotalCollection] = useState(0);
    const [currentTime, setCurrentTime] = useState(dayjs());

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch Data
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [staffRes, patientRes, deptRes, apptRes, hospitalRes, doctorRes, invoiceRes, billingRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/staff`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/patients`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/departments`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/appointments`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/hospitals`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/invoices`),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/billing`),
                ]);

                if (!staffRes.ok || !patientRes.ok || !deptRes.ok || !doctorRes.ok) throw new Error('API Error');

                const pData = await patientRes.json();
                const aData = await apptRes.json();
                const hData = await hospitalRes.json();
                const doctorsData = await doctorRes.json();
                const invoicesData = await invoiceRes.json();
                const billsData = await billingRes.json();

                const invoicesArray = Array.isArray(invoicesData)
                    ? invoicesData
                    : invoicesData.invoices || invoicesData.data || [];

                const billsArray = Array.isArray(billsData)
                    ? billsData
                    : billsData.bills || billsData.data || [];

                setInvoices(invoicesArray);

                // ---- TODAY'S COLLECTION (Paid & Pending) ----
                const today = new Date().toDateString();

                const todayBills = billsArray.filter(bill =>
                    bill.generated_at &&
                    new Date(bill.generated_at).toDateString() === today
                );

                const todayPaid = todayBills
                    .filter(bill => bill.status === 'Paid')
                    .reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);

                const todayPending = todayBills
                    .filter(bill => bill.status === 'Pending')
                    .reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);

                setTodayCollection({ paid: todayPaid, pending: todayPending });

                // ---- TOTAL REGISTERED COLLECTION (Paid BILLS only) ----
                const totalAmount = billsArray
                    .filter(bill => bill.status === 'Paid')
                    .reduce((sum, bill) => sum + Number(bill.total_amount || 0), 0);

                setTotalCollection(totalAmount);

                setDoctors(doctorsData || []);

                setStaff(await staffRes.json());
                setPatients(pData.patients || []);
                setDepartments(await deptRes.json());
                setAppointments(aData);
                if (hData && hData.length > 0) setHospitalInfo(hData[0]);

                // Process Calendar Events
                const events = aData.map(appt => {
                    const start = getAppointmentStartDate(appt);
                    const end = getAppointmentEndDate(appt);

                    return {
                        title: `${appt.patient_id?.first_name || 'Patient'} (${appt.type})`,
                        start,
                        end,
                        resource: appt,
                        allDay: false
                    };
                });
                setCalendarEvents(events);

            } catch (err) {
                console.error("Dashboard Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSavePatient = async (updatedPatient) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/${updatedPatient._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPatient),
            });
            if (res.ok) {
                const saved = await res.json();
                setPatients(prev => prev.map(p => p._id === saved._id ? saved : p));
                setSelectedPatient(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const eventStyleGetter = (event) => {
        const style = {
            backgroundColor: event.resource.status === 'Completed' ? '#10b981' : '#0d9488',
            borderRadius: '4px',
            opacity: 0.9,
            color: 'white',
            border: 'none',
            fontSize: '0.8rem'
        };
        return { style };
    };

    if (loading) return (
        <Layout sidebarItems={staffSidebar} section="Staff">
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600 mb-4"></div>
                <p className="text-slate-500 font-medium">Loading Dashboard...</p>
            </div>
        </Layout>
    );

    const todayDateString = new Date().toDateString();

    const todayPatientsCount = patients.filter(p =>
        p.registered_at && new Date(p.registered_at).toDateString() === todayDateString
    ).length;

    const todayAppointmentsCount = appointments.filter(appt =>
        appt.appointment_date && new Date(appt.appointment_date).toDateString() === todayDateString
    ).length;

    return (
        <Layout sidebarItems={staffSidebar} section="Staff">
            <style>{calendarStyles}</style>
            <PatientDetailModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} onSave={handleSavePatient} />

            <div className="bg-slate-50/50 min-h-screen p-6 font-sans">
                <div className="max-w-[1600px] mx-auto space-y-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Staff Overview</h1>
                            <p className="text-slate-500 text-sm mt-1">Manage hospital resources and patient flows.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-slate-600">
                                <Clock size={16} className="text-teal-600" />
                                <span className="font-medium text-sm">{dayjs().format('dddd, MMMM D, YYYY')}</span>
                            </div>
                            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-4 py-2 rounded-lg shadow-sm border border-teal-200 flex items-center gap-2">
                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                                <span className="font-bold text-teal-700 font-mono text-sm tracking-wide">{currentTime.format('HH:mm:ss')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            title="Today's Registered Patients"
                            value={todayPatientsCount}
                            icon={<UserIcon />}
                            color={{ bg: 'bg-teal-50', text: 'text-teal-600' }}
                            onClick={() => navigate('/dashboard/staff/patient-list')}
                        />
                        <StatCard
                            title="Today's Appointments"
                            value={todayAppointmentsCount}
                            icon={<FaUser />}
                            color={{ bg: 'bg-indigo-50', text: 'text-indigo-600' }}
                            onClick={() => navigate('/dashboard/staff/appointments')}
                        />
                        <StatCard
                            title="Today's Registration Collection"
                            value={
                                <div className="flex flex-col">
                                    <span className="text-green-600">₹{todayCollection.paid || 0}</span>
                                    {(todayCollection.pending > 0) && (
                                        <span className="text-sm text-amber-600 mt-1">
                                            Pending: ₹{todayCollection.pending}
                                        </span>
                                    )}
                                </div>
                            }
                            icon={<FaMoneyBill />}
                            color={{ bg: 'bg-blue-50', text: 'text-blue-600' }}
                            onClick={() => navigate('/dashboard/staff/billing')}
                        />
                        {/* <StatCard
                            title="Total Registration Collection"
                            value={`₹${Number(totalCollection)}`}
                            icon={<FaMoneyBill />}
                            color={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }}
                            onClick={() => navigate('/dashboard/staff/billing')}
                        /> */}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Left Column (Charts & Calendar) */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Charts Row */}
                            <div className="grid grid-cols-1 gap-6">
                                <div className="h-[350px]">
                                    <PatientRegistrationChart patients={patients} />
                                </div>
                                {/* <div className="h-[350px]">
                                    <StaffDistributionChart staff={staff} departments={departments} />
                                </div> */}
                            </div>

                            {/* Calendar Section - NOW RESTORED */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-slate-800">Professional Calendar</h3>
                                    <div className="flex gap-2">

                                    </div>
                                </div>
                                <div className="h-[500px]">
                                    <BigCalendar
                                        localizer={localizer}
                                        events={calendarEvents}
                                        startAccessor="start"
                                        endAccessor="end"
                                        style={{ height: '100%' }}
                                        views={['month', 'week', 'day']}
                                        view={currentView}
                                        date={currentDate}
                                        onNavigate={setCurrentDate}
                                        onView={setCurrentView}
                                        eventPropGetter={eventStyleGetter}
                                        onSelectEvent={(event) => {
                                            setSelectedCalendarAppt(event.resource);
                                            setIsApptModalOpen(true);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column (Lists) */}
                        <div className="space-y-6">
                            <div className="h-[400px]">
                                <RecentAppointments appointments={appointments} />
                            </div>
                            <div className="h-[500px]">
                                <PatientList patients={patients} onPatientClick={setSelectedPatient} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Appointment Slip Modal */}
            {isApptModalOpen && selectedCalendarAppt && (
                <AppointmentSlipModal
                    isOpen={isApptModalOpen}
                    onClose={() => { setIsApptModalOpen(false); setSelectedCalendarAppt(null); }}
                    appointmentData={selectedCalendarAppt}
                    hospitalInfo={hospitalInfo}
                />
            )}
        </Layout>
    );
};

export default StaffDashboard;