import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faUserMd, faUserNurse, faUserTie, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

// Basic UI Components
const Label = ({ children, required }) => (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
        {children} {required && <span className="text-rose-500">*</span>}
    </label>
);

const StaffLoginModal = ({ isOpen, onClose }) => {
    const [role, setRole] = useState(''); // 'doctor', 'nurse', 'registrar'
    const [list, setList] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [details, setDetails] = useState({ email: '', department: '', name: '' });
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingList, setFetchingList] = useState(false);
    const [success, setSuccess] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setRole('');
            setList([]);
            setSelectedId('');
            setDetails({ email: '', department: '', name: '' });
            setPassword('');
            setSuccess(false);
        }
    }, [isOpen]);

    // Fetch list when role changes
    useEffect(() => {
        if (!role) {
            setList([]);
            return;
        }

        const fetchData = async () => {
            setFetchingList(true);
            setList([]);
            setSelectedId('');
            setDetails({ email: '', department: '', name: '' });
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
                    filtered = res.data; // All doctors
                } else if (role === 'nurse') {
                    // Filter for nurses
                    filtered = res.data.filter(s =>
                        (s.role && s.role.toLowerCase() === 'nurse') ||
                        (s.role && s.role.toLowerCase() === 'staff') // Some staff might be potential nurses
                    );
                } else if (role === 'registrar') {
                    // Filter for registrar/registrar
                    filtered = res.data.filter(s =>
                        (s.role && ['registrar', 'registrar', 'admin', 'staff', 'other'].includes(s.role.toLowerCase()))
                    );
                }
                setList(filtered);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setFetchingList(false);
            }
        };

        fetchData();
    }, [role]);

    // Update details when person is selected
    useEffect(() => {
        if (!selectedId) {
            setDetails({ email: '', department: '', name: '' });
            return;
        }

        const person = list.find(item => item._id === selectedId);
        if (person) {
            // Name handling might differ between Doctor (firstName, lastName) and Staff (first_name, last_name or full_name)
            let name = person.name || person.fullName || person.full_name;
            if (!name) {
                const f = person.firstName || person.first_name || '';
                const l = person.lastName || person.last_name || '';
                name = `${f} ${l}`.trim();
            }

            setDetails({
                email: person.email || '',
                department: person.department?.name || person.department || '', // Doctor has populated dept, Staff might be string
                name: name
            });
        }
    }, [selectedId, list]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role || !selectedId || !password) return;

        setLoading(true);
        try {
            // Determine endpoint
            const endpoint = role === 'doctor' ? 'doctors' : 'staff';

            // Prepare payload - we are updating the existing record with a password
            const payload = {
                password: password,
                // For Staff/Nurse, we might need to send other fields to satisfy 'update' requirements or just send what changed.
                // Based on controllers, just sending password + existing required fields might be safest, 
                // OR the controller might handle partial updates (findByIdAndUpdate usually does).
                // Let's send basic identifiers + password.
                email: details.email,
                fullName: details.name, // Used by staff controller to update User name
            };

            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/${endpoint}/${selectedId}`, payload);

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            console.error("Error creating login:", err);
            alert(err.response?.data?.error || "Failed to create login credential.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Staff Login Creation</h2>
                        <p className="text-xs text-slate-500 mt-1">Create or reset password for staff members</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center animate-fade-in">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 text-3xl">
                            <FontAwesomeIcon icon={faCheckCircle} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Success!</h3>
                        <p className="text-slate-500 mt-2">Login credentials have been created successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">

                        {/* Role Selection */}
                        <div>
                            <Label required>Select Role</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'doctor', label: 'Doctor', icon: faUserMd, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                                    { id: 'nurse', label: 'Nurse', icon: faUserNurse, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                                    { id: 'registrar', label: 'Registrar', icon: faUserTie, color: 'text-purple-600 bg-purple-50 border-purple-200' }
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setRole(r.id)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${role === r.id
                                                ? `${r.color} shadow-sm ring-2 ring-offset-1 ring-gray-100`
                                                : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={r.icon} className={`text-xl mb-2 ${role === r.id ? '' : 'text-slate-400'}`} />
                                        <span className="text-xs font-bold">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Staff Selection */}
                        <div className={`transition-all duration-300 ${role ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <Label required>Select Staff Member</Label>
                            <div className="relative">
                                <select
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none"
                                    disabled={!role || fetchingList}
                                >
                                    <option value="">{fetchingList ? 'Loading list...' : 'Select a person...'}</option>
                                    {list.map(item => {
                                        let name = item.name || item.fullName || item.full_name;
                                        if (!name) {
                                            const f = item.firstName || item.first_name || '';
                                            const l = item.lastName || item.last_name || '';
                                            name = `${f} ${l}`.trim();
                                        }
                                        return (
                                            <option key={item._id} value={item._id}>
                                                {name} {item.department ? `(${item.department.name || item.department})` : ''}
                                            </option>
                                        );
                                    })}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Auto-filled Details */}
                        {selectedId && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-fade-in">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                                    <p className="text-sm font-medium text-slate-700 truncate">{details.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                                    <p className="text-sm font-medium text-slate-700 truncate">{details.department || 'N/A'}</p>
                                </div>
                            </div>
                        )}

                        {/* Password Input */}
                        <div className={`transition-all duration-300 ${selectedId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <Label required>Set Password</Label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                                disabled={!selectedId}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !password || !selectedId}
                                className="flex-1 py-3 px-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 disabled:opacity-70 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                            >
                                {loading ? 'Creating...' : 'Create Login'}
                            </button>
                        </div>

                    </form>
                )}
            </div>
        </div>
    );
};

export default StaffLoginModal;
