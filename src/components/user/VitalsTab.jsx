import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHeartbeat, FaCheckCircle, FaTimesCircle, FaSave, FaNotesMedical, FaWeight, FaThermometerHalf, FaLungs } from 'react-icons/fa';
import { MdBloodtype } from 'react-icons/md';

const VitalsTab = ({ hospitalData }) => {
    const [loading, setLoading] = useState(false);
    const [vitalsEnabled, setVitalsEnabled] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Initialize state from hospitalData or local storage
    useEffect(() => {
        if (hospitalData) {
            const isEnabled = hospitalData.vitalsEnabled !== undefined ? hospitalData.vitalsEnabled : true;
            setVitalsEnabled(isEnabled);
            localStorage.setItem('vitalsEnabled', isEnabled);
        }
    }, [hospitalData]);

    const handleSave = async () => {
        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            // Update hospital settings
            await axios.patch(
                `${import.meta.env.VITE_BACKEND_URL}/hospitals/${hospitalData._id}/details`,
                {
                    vitalsEnabled: vitalsEnabled
                }
            );

            // Update local storage
            localStorage.setItem('vitalsEnabled', vitalsEnabled);

            // Notify other components (Sidebar, etc.)
            window.dispatchEvent(new Event('vitals-updated'));

            setMessage({ type: 'success', text: 'Vitals settings updated successfully!' });

            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Error updating vitals settings:', err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update settings' });
        } finally {
            setLoading(false);
        }
    };

    // List of standard vitals fields that are part of the system
    const vitalsFields = [
        { name: 'Blood Pressure', icon: FaHeartbeat, unit: 'mmHg', description: 'Systolic and Diastolic pressure' },
        { name: 'Pulse Rate', icon: FaHeartbeat, unit: 'bpm', description: 'Heart beats per minute' },
        { name: 'Body Temperature', icon: FaThermometerHalf, unit: '°F/°C', description: 'Body temperature reading' },
        { name: 'Weight', icon: FaWeight, unit: 'kg', description: 'Patient body weight' },
        { name: 'SpO2', icon: FaLungs, unit: '%', description: 'Oxygen saturation level' },
        // { name: 'Respiratory Rate', icon: FaLungs, unit: 'breath/min', description: 'Breaths per minute' },
        // { name: 'Sugar (RBS/FBS)', icon: MdBloodtype, unit: 'mg/dL', description: 'Blood glucose levels' },
    ];

    return (
        <div className="font-sans">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaHeartbeat className="text-rose-500" />
                        Vitals Configuration
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Manage patient vitals data collection settings</p>
                </div>
            </div>

            {/* Flash Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    {message.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                        <div>
                            <h4 className="font-semibold text-slate-800">Enable Vitals Collection</h4>
                            <p className="text-sm text-slate-500">If disabled, the Nurses section will be hidden and doctors won't be required to check vitals.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                value=""
                                className="sr-only peer"
                                checked={vitalsEnabled}
                                onChange={(e) => setVitalsEnabled(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end mb-8">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-semibold disabled:opacity-50 shadow-sm"
                        >
                            <FaSave /> {loading ? 'Saving Settings...' : 'Save Settings'}
                        </button>
                    </div>

                    <div className={`transition-opacity duration-300 ${vitalsEnabled ? 'opacity-100' : 'opacity-50 grayscale pointer-events-none'}`}>
                        <h4 className="text-md font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <FaNotesMedical className="text-teal-500" />
                            Available Vitals Fields
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vitalsFields.map((field, index) => {
                                const Icon = field.icon;
                                return (
                                    <div key={index} className="flex items-start p-3 bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-2 bg-rose-50 text-rose-500 rounded-lg mr-3">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-slate-800 text-sm">{field.name}</h5>
                                            <p className="text-xs text-slate-500 mt-1">{field.description}</p>
                                            <span className="inline-block mt-2 text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                Unit: {field.unit}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VitalsTab;
