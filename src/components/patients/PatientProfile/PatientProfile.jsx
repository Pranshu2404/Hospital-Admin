import { useState } from 'react';
import PersonalInfoTab from './PersonalInfoTab';
import DiagnosisTab from './DiagnosisTab';  
import PrescriptionTab from './PrescriptionTab';
import ChargesTab from './ChargesTab';
import PaymentTab from './PaymentTab';
import { PersonIcon, DiagnosisIcon, PrescriptionIcon, ChargesIcon, PaymentIcon } from '../../common/Icons';

const PatientProfile = ({ selectedPatient, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState('personal');

  if (!selectedPatient) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">No patient selected</p>
          <button 
            onClick={() => setCurrentPage('IpdOpdPatientList')}
            className="mt-4 text-teal-600 hover:text-teal-800"
          >
            Go back to patient list
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { 
      id: 'personal', 
      label: 'Personal Info', 
      icon: <PersonIcon />,
      component: PersonalInfoTab 
    },
    { 
      id: 'diagnosis', 
      label: 'Diagnosis', 
      icon: <DiagnosisIcon />,
      component: DiagnosisTab 
    },
    { 
      id: 'prescription', 
      label: 'Prescription', 
      icon: <PrescriptionIcon />,
      component: PrescriptionTab 
    },
    { 
      id: 'charges', 
      label: 'Charges', 
      icon: <ChargesIcon />,
      component: ChargesTab 
    },
    { 
      id: 'payment', 
      label: 'Payment', 
      icon: <PaymentIcon />,
      component: PaymentTab 
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Patient Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-bold text-xl">
                  {selectedPatient.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span>ID: #{selectedPatient.id}</span>
                  <span>•</span>
                  <span>{selectedPatient.age} years old</span>
                  <span>•</span>
                  <span>{selectedPatient.gender}</span>
                  <span>•</span>
                  <span>{selectedPatient.type}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('IpdOpdPatientList')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to List
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {ActiveComponent && <ActiveComponent patient={selectedPatient} />}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
