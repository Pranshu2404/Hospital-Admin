import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaHeartbeat, FaCheckCircle, FaTimesCircle, FaSave, 
  FaNotesMedical, FaWeight, FaThermometerHalf, FaLungs,
  FaUserMd, FaUserNurse, FaUserTie 
} from 'react-icons/fa';
import { MdBloodtype } from 'react-icons/md';

const VitalsTab = ({ hospitalData }) => {
    const [loading, setLoading] = useState(false);
    const [vitalsEnabled, setVitalsEnabled] = useState(true);
    const [vitalsController, setVitalsController] = useState('nurse'); // Default to nurse
    const [message, setMessage] = useState({ type: '', text: '' });

    // Initialize state from hospitalData or local storage
    useEffect(() => {
        if (hospitalData) {
            const isEnabled = hospitalData.vitalsEnabled !== undefined ? hospitalData.vitalsEnabled : true;
            const controller = hospitalData.vitalsController || 'nurse';
            
            setVitalsEnabled(isEnabled);
            setVitalsController(controller);
            
            localStorage.setItem('vitalsEnabled', isEnabled);
            localStorage.setItem('vitalsController', controller);
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
                    vitalsEnabled: vitalsEnabled,
                    vitalsController: vitalsController
                }
            );

            // Update local storage
            localStorage.setItem('vitalsEnabled', vitalsEnabled);
            localStorage.setItem('vitalsController', vitalsController);

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

    // Controller options with icons and descriptions
    const controllerOptions = [
        { 
            value: 'doctor', 
            label: 'Doctor', 
            icon: FaUserMd,
            description: 'Doctors will have full control to add and manage vitals',
            color: 'blue'
        },
        { 
            value: 'nurse', 
            label: 'Nurse', 
            icon: FaUserNurse,
            description: 'Nurses will be responsible for recording and managing vitals',
            color: 'green'
        },
        { 
            value: 'registrar', 
            label: 'Registrar', 
            icon: FaUserTie,
            description: 'Registrars can record vitals during patient registration',
            color: 'purple'
        }
    ];

    // List of standard vitals fields that are part of the system
    const vitalsFields = [
        { name: 'Blood Pressure', icon: FaHeartbeat, unit: 'mmHg', description: 'Systolic and Diastolic pressure' },
        { name: 'Pulse Rate', icon: FaHeartbeat, unit: 'bpm', description: 'Heart beats per minute' },
        { name: 'Body Temperature', icon: FaThermometerHalf, unit: '°F/°C', description: 'Body temperature reading' },
        { name: 'Weight', icon: FaWeight, unit: 'kg', description: 'Patient body weight' },
        { name: 'SpO2', icon: FaLungs, unit: '%', description: 'Oxygen saturation level' },
        { name: 'Respiratory Rate', icon: FaLungs, unit: 'breath/min', description: 'Breaths per minute' },
        { name: 'Sugar (RBS/FBS)', icon: MdBloodtype, unit: 'mg/dL', description: 'Blood glucose levels' },
    ];

    // Get controller icon color
    const getControllerColor = (controller) => {
        const option = controllerOptions.find(opt => opt.value === controller);
        return option?.color || 'gray';
    };

    return (
        <div className="font-sans">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaHeartbeat className="text-rose-500" />
                        Vitals Configuration
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Manage patient vitals data collection settings and access control</p>
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
                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
                        <div>
                            <h4 className="font-semibold text-slate-800">Enable Vitals Collection</h4>
                            <p className="text-sm text-slate-500">If disabled, vitals section will be hidden throughout the system.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={vitalsEnabled}
                                onChange={(e) => setVitalsEnabled(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    {/* Controller Selection - New Section */}
                    <div className={`mb-8 transition-opacity duration-300 ${vitalsEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FaUserMd className="text-teal-500" />
                            Assign Vitals Control To:
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {controllerOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected = vitalsController === option.value;
                                const colorClasses = {
                                    blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200',
                                    green: isSelected ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-200',
                                    purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-200'
                                };

                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => setVitalsController(option.value)}
                                        className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${colorClasses[option.color]}`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <FaCheckCircle className={`text-${option.color}-500`} size={16} />
                                            </div>
                                        )}
                                        <div className="flex items-start gap-3">
                                            <div className={`p-3 rounded-lg bg-${option.color}-100 text-${option.color}-600`}>
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-slate-800">{option.label}</h5>
                                                <p className="text-xs text-slate-500 mt-1">{option.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Current Controller Badge */}
                        {vitalsEnabled && (
                            <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-lg">
                                <p className="text-sm text-teal-700 flex items-center gap-2">
                                    <span className="font-medium">Current Controller:</span>
                                    <span className="flex items-center gap-1 px-2 py-1 bg-white rounded-full">
                                        {controllerOptions.find(opt => opt.value === vitalsController)?.icon && 
                                            (() => {
                                                const Icon = controllerOptions.find(opt => opt.value === vitalsController).icon;
                                                return <Icon size={14} className={`text-${getControllerColor(vitalsController)}-600`} />;
                                            })()
                                        }
                                        <span className="capitalize">{vitalsController}</span>
                                    </span>
                                    <span className="text-xs text-teal-600">
                                        will have full control to add, edit, and manage patient vitals
                                    </span>
                                </p>
                            </div>
                        )}
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

                    {/* Vitals Fields Display */}
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