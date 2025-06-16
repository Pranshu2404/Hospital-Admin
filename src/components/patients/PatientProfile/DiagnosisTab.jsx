import { useState } from 'react';
import { Button } from '../../common/FormElements';
import { PlusIcon } from '../../common/Icons';

const DiagnosisTab = ({ patient }) => {
  const [diagnoses] = useState([
    {
      id: 1,
      date: '2024-01-15',
      doctor: 'Dr. Sarah Wilson',
      diagnosis: 'Hypertension',
      description: 'Elevated blood pressure readings, requires medication management',
      severity: 'Moderate',
      status: 'Active'
    },
    {
      id: 2,
      date: '2024-01-10',
      doctor: 'Dr. Michael Chen',
      diagnosis: 'Type 2 Diabetes',
      description: 'Blood glucose levels elevated, dietary modifications recommended',
      severity: 'Mild',
      status: 'Active'
    },
    {
      id: 3,
      date: '2023-12-20',
      doctor: 'Dr. Lisa Anderson',
      diagnosis: 'Upper Respiratory Infection',
      description: 'Viral infection, treated with supportive care',
      severity: 'Mild',
      status: 'Resolved'
    }
  ]);

  const getSeverityBadge = (severity) => {
    const severityClasses = {
      'Mild': 'bg-green-100 text-green-800',
      'Moderate': 'bg-yellow-100 text-yellow-800',
      'Severe': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${severityClasses[severity] || 'bg-gray-100 text-gray-800'}`;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'bg-blue-100 text-blue-800',
      'Resolved': 'bg-green-100 text-green-800',
      'Chronic': 'bg-purple-100 text-purple-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Medical Diagnosis</h3>
        <Button variant="primary" size="sm">
          <PlusIcon />
          Add Diagnosis
        </Button>
      </div>

      <div className="space-y-4">
        {diagnoses.map((diagnosis) => (
          <div key={diagnosis.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{diagnosis.diagnosis}</h4>
                <p className="text-sm text-gray-500">
                  Diagnosed by {diagnosis.doctor} on {diagnosis.date}
                </p>
              </div>
              <div className="flex space-x-2">
                <span className={getSeverityBadge(diagnosis.severity)}>
                  {diagnosis.severity}
                </span>
                <span className={getStatusBadge(diagnosis.status)}>
                  {diagnosis.status}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-4">{diagnosis.description}</p>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {diagnoses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No diagnoses recorded</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new diagnosis.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosisTab;
