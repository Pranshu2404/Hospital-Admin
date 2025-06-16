import { useState } from 'react';
import { Button } from '../../common/FormElements';
import { EditIcon } from '../../common/Icons';

const PersonalInfoTab = ({ patient }) => {
  const [isEditing, setIsEditing] = useState(false);

  const personalInfo = [
    { label: 'Full Name', value: patient.name },
    { label: 'Age', value: `${patient.age} years` },
    { label: 'Gender', value: patient.gender },
    { label: 'Phone', value: patient.phone },
    { label: 'Email', value: patient.email },
    { label: 'Blood Group', value: patient.bloodGroup },
    { label: 'Patient Type', value: patient.type },
    { label: 'Status', value: patient.status }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          <EditIcon />
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {personalInfo.map((info, index) => (
          <div key={index} className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">{info.label}</dt>
            <dd className="text-sm text-gray-900">{info.value}</dd>
          </div>
        ))}
      </div>

      {/* Emergency Contact Section */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Contact Name</dt>
            <dd className="text-sm text-gray-900">Jane Doe</dd>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Contact Phone</dt>
            <dd className="text-sm text-gray-900">+1 234-567-8999</dd>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Relationship</dt>
            <dd className="text-sm text-gray-900">Spouse</dd>
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Address</h4>
        <div className="border-b border-gray-100 pb-4">
          <dt className="text-sm font-medium text-gray-500 mb-1">Address</dt>
          <dd className="text-sm text-gray-900">
            123 Main Street<br />
            New York, NY 10001<br />
            United States
          </dd>
        </div>
      </div>

      {/* Medical Information */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Medical Information</h4>
        <div className="grid grid-cols-1 gap-6">
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Medical History</dt>
            <dd className="text-sm text-gray-900">No significant medical history</dd>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Allergies</dt>
            <dd className="text-sm text-gray-900">Penicillin, Peanuts</dd>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Current Medications</dt>
            <dd className="text-sm text-gray-900">None</dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;
