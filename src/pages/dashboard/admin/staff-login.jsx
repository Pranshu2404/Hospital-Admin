import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMd, faUserNurse, faUserTie, faCheckCircle, faSearch, faKey } from "@fortawesome/free-solid-svg-icons";
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const StaffLoginPage = () => {
    const [role, setRole] = useState('doctor'); // Default to doctor
    const [list, setList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [details, setDetails] = useState({ email: '', department: '', name: '', phone: '' });
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingList, setFetchingList] = useState(false);

    // Fetch list when role changes
    useEffect(() => {
        const fetchData = async () => {
            setFetchingList(true);
            setList([]);
            setSelectedId('');
            setSearchQuery('');
            setDetails({ email: '', department: '', name: '', phone: '' });
            try {
                let url = '';
                if (role === 'doctor') {
                    url = `${import.meta.env.VITE_BACKEND_URL}/doctors`;
                } else {
                    url = `${import.meta.env.VITE_BACKEND_URL}/staff`;
                }

                const res = await axios.get(url);

                let filtered = [];
                if (role === 'doctor') {
                    filtered = res.data;
                } else if (role === 'nurse') {
                    filtered = res.data.filter(s =>
                        (s.role && s.role.toLowerCase() === 'nurse') ||
                        (s.role && s.role.toLowerCase() === 'staff')
                    );
                } else if (role === 'registrar') {
                    filtered = res.data.filter(s =>
                        (s.role && ['receptionist', 'registrar', 'admin', 'staff', 'other'].includes(s.role.toLowerCase()))
                    );
                }
                setList(filtered);
                setFilteredList(filtered);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setFetchingList(false);
            }
        };

        fetchData();
    }, [role]);

    // Handle Search
    useEffect(() => {
        if (!searchQuery) {
            setFilteredList(list);
        } else {
            const lower = searchQuery.toLowerCase();
            const filtered = list.filter(item => {
                let name = item.name || item.fullName || item.full_name || '';
                if (!name) {
                    const f = item.firstName || item.first_name || '';
                    const l = item.lastName || item.last_name || '';
                    name = `${f} ${l}`;
                }
                const phone = item.phone || '';
                return name.toLowerCase().includes(lower) || phone.includes(lower);
            });
            setFilteredList(filtered);
        }
    }, [searchQuery, list]);

    // Update details when person is selected
    useEffect(() => {
        if (!selectedId) {
            setDetails({ email: '', department: '', name: '', phone: '' });
            return;
        }

        const person = list.find(item => item._id === selectedId);
        if (person) {
            let name = person.name || person.fullName || person.full_name;
            if (!name) {
                const f = person.firstName || person.first_name || '';
                const l = person.lastName || person.last_name || '';
                name = `${f} ${l}`.trim();
            }

            setDetails({
                email: person.email || '',
                department: person.department?.name || person.department || '',
                name: name,
                phone: person.phone || ''
            });
        }
    }, [selectedId, list]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role || !selectedId || !password) return;

        setLoading(true);
        try {
            const endpoint = role === 'doctor' ? 'doctors' : 'staff';
            const payload = {
                password: password,
                email: details.email,
                fullName: details.name,
            };

            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/${endpoint}/${selectedId}`, payload);

            alert("Credential created/updated successfully!");
            setPassword(''); // Clear password after success

        } catch (err) {
            console.error("Error creating login:", err);
            alert(err.response?.data?.error || "Failed to create login credential.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout sidebarItems={adminSidebar}>
            <div className="p-2 h-[calc(100vh-80px)] overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Staff Login Credentials</h1>
                            <p className="text-slate-500 mt-1">Create or update login passwords for all hospital staff.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Panel: Role & Selection */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Role Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'doctor', label: 'Doctor', icon: faUserMd, color: 'teal' },
                                    { id: 'nurse', label: 'Nurse', icon: faUserNurse, color: 'teal' },
                                    { id: 'registrar', label: 'Registrar', icon: faUserTie, color: 'teal' }
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        onClick={() => setRole(r.id)}
                                        className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group
                                        ${role === r.id
                                                ? `bg-white border-${r.color}-500 shadow-md ring-1 ring-${r.color}-500 transform scale-[1.02]`
                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-full bg-${r.color}-50 ${role === r.id ? `text-${r.color}-600` : 'text-slate-400 group-hover:text-slate-600'}`}>
                                            <FontAwesomeIcon icon={r.icon} className="text-xl" />
                                        </div>
                                        <span className={`font-bold text-sm ${role === r.id ? 'text-slate-800' : 'text-slate-500'}`}>{r.label}</span>
                                        {role === r.id && (
                                            <div className={`absolute top-0 right-0 p-1.5 bg-${r.color}-500 text-white rounded-bl-lg`}>
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Search & List */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[320px]">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                    <div className="relative">
                                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder={`Search ${role}...`}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                    {fetchingList ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                                            <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Loading staff list...</span>
                                        </div>
                                    ) : filteredList.length > 0 ? (
                                        filteredList.map(item => {
                                            let name = item.name || item.fullName || item.full_name;
                                            if (!name) {
                                                const f = item.firstName || item.first_name || '';
                                                const l = item.lastName || item.last_name || '';
                                                name = `${f} ${l}`.trim();
                                            }
                                            const isSelected = selectedId === item._id;

                                            return (
                                                <button
                                                    key={item._id}
                                                    onClick={() => setSelectedId(item._id)}
                                                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group
                                                    ${isSelected
                                                            ? 'bg-teal-50 border border-teal-100 shadow-sm'
                                                            : 'hover:bg-slate-50 border border-transparent'
                                                        }`}
                                                >
                                                    <div>
                                                        <p className={`font-semibold text-sm ${isSelected ? 'text-teal-900' : 'text-slate-700'}`}>{name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                                                    </div>
                                                    {isSelected && <FontAwesomeIcon icon={faCheckCircle} className="text-teal-500" />}
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                            <p className="text-sm">No records found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Action Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                                        <FontAwesomeIcon icon={faKey} />
                                    </span>
                                    Set Credentials
                                </h3>

                                {selectedId ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Selected Staff</label>
                                                    <p className="font-semibold text-slate-800">{details.name}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Department</label>
                                                    <p className="text-sm text-slate-600">{details.department || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email (Login ID)</label>
                                                    <p className="text-sm text-slate-600 break-all">{details.email}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">
                                                    New Password <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Type secure password..."
                                                    className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading || !password}
                                            className="w-full py-3.5 px-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>Processing...</>
                                            ) : (
                                                <>Save Credentials</>
                                            )}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-10 text-slate-400">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                            <FontAwesomeIcon icon={faUserTie} className="text-2xl" />
                                        </div>
                                        <p className="text-sm">Select a staff member from the list to set their password.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StaffLoginPage;
