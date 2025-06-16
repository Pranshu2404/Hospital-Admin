import { useState } from 'react';
import { Button } from '../../common/FormElements';
import { PlusIcon, PrintIcon } from '../../common/Icons';

const PrescriptionTab = ({ patient }) => {
  const [prescriptions] = useState([
    {
      id: 1,
      date: '2024-01-15',
      doctor: 'Dr. Sarah Wilson',
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take with food'
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with meals'
        }
      ],
      status: 'Active',
      notes: 'Continue current medications. Monitor blood pressure and glucose levels.'
    },
    {
      id: 2,
      date: '2024-01-01',
      doctor: 'Dr. Michael Chen',
      medications: [
        {
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Three times daily',
          duration: '7 days',
          instructions: 'Complete full course'
        }
      ],
      status: 'Completed',
      notes: 'Antibiotic course for respiratory infection.'
    }
  ]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'bg-green-100 text-green-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Discontinued': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Prescriptions</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <PrintIcon />
            Print All
          </Button>
          <Button variant="primary" size="sm">
            <PlusIcon />
            New Prescription
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Prescription #{prescription.id}
                </h4>
                <p className="text-sm text-gray-500">
                  Prescribed by {prescription.doctor} on {prescription.date}
                </p>
              </div>
              <span className={getStatusBadge(prescription.status)}>
                {prescription.status}
              </span>
            </div>

            {/* Medications List */}
            <div className="mb-4">
              <h5 className="text-md font-medium text-gray-900 mb-3">Medications</h5>
              <div className="space-y-3">
                {prescription.medications.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <h6 className="font-medium text-gray-900">{medication.name}</h6>
                      <p className="text-sm text-gray-600">
                        {medication.dosage} - {medication.frequency} for {medication.duration}
                      </p>
                      {medication.instructions && (
                        <p className="text-xs text-gray-500 mt-1">
                          Instructions: {medication.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div className="mb-4">
                <h5 className="text-md font-medium text-gray-900 mb-2">Notes</h5>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  {prescription.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                <PrintIcon />
                Print
              </Button>
              <Button variant="outline" size="sm">
                Edit
              </Button>
              {prescription.status === 'Active' && (
                <Button variant="danger" size="sm">
                  Discontinue
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {prescriptions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No prescriptions found</h3>
            <p className="mt-1 text-sm text-gray-500">Start by creating a new prescription.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionTab;
