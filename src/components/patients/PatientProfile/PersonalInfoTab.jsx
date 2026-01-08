import { useState } from 'react';
import { Button } from '../../common/FormElements';
import { EditIcon } from '../../common/Icons';
import { useNavigate } from 'react-router-dom';

const PersonalInfoTab = ({ patient }) => {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Format date of birth for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years`;
  };

  // Determine patient type display
  const getPatientTypeDisplay = (type) => {
    const types = {
      'opd': 'OPD',
      'ipd': 'IPD'
    };
    return types[type] || type || 'N/A';
  };

  // Determine status based on admission date for IPD patients
  const getPatientStatus = (patient) => {
    if (patient.patient_type === 'ipd') {
      return patient.admission_date ? 'Admitted' : 'Registered';
    }
    return 'Active';
  };

  const personalInfo = [
    { label: 'Salutation', value: patient.salutation || 'N/A' },
    { label: 'Full Name', value: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() },
    { label: 'Date of Birth', value: formatDate(patient.dob) },
    { label: 'Age', value: calculateAge(patient.dob) },
    { label: 'Gender', value: patient.gender?.charAt(0).toUpperCase() + patient.gender?.slice(1) || 'N/A' },
    { label: 'Phone', value: patient.phone || 'N/A' },
    { label: 'Email', value: patient.email || 'N/A' },
    { label: 'Blood Group', value: patient.blood_group || 'N/A' },
    { label: 'Patient ID', value: patient.patientId || 'N/A' },
    { label: 'Patient Type', value: getPatientTypeDisplay(patient.patient_type) },
    { label: 'Status', value: getPatientStatus(patient) },
    { label: 'Registered Date', value: formatDate(patient.registered_at) }
  ];

  // If patient is IPD, add admission date
  if (patient.patient_type === 'ipd' && patient.admission_date) {
    personalInfo.splice(9, 0, { 
      label: 'Admission Date', 
      value: formatDate(patient.admission_date) 
    });
  }

  const handleEditClick = () => {
    // Navigate to update patient profile page
    navigate(`/dashboard/admin/patients/update/${patient._id}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
        >
          <EditIcon className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {personalInfo.map((info, index) => (
          <div key={index} className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">{info.label}</dt>
            <dd className="text-sm text-gray-900 font-medium">{info.value}</dd>
          </div>
        ))}
      </div>

      {/* Address Information */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Address Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Address</dt>
            <dd className="text-sm text-gray-900">{patient.address || 'Not provided'}</dd>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">City</dt>
            <dd className="text-sm text-gray-900">{patient.city || 'Not provided'}</dd>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">State</dt>
            <dd className="text-sm text-gray-900">{patient.state || 'Not provided'}</dd>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">ZIP Code</dt>
            <dd className="text-sm text-gray-900">{patient.zipCode || 'Not provided'}</dd>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Contact Name</dt>
            <dd className="text-sm text-gray-900">{patient.emergency_contact || 'Not provided'}</dd>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Contact Phone</dt>
            <dd className="text-sm text-gray-900">{patient.emergency_phone || 'Not provided'}</dd>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Relationship</dt>
            <dd className="text-sm text-gray-900">{patient.emergency_relationship || 'Not provided'}</dd>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Medical Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-b border-gray-100 pb-4 md:col-span-2">
            <dt className="text-sm font-medium text-gray-500 mb-1">Medical History</dt>
            <dd className="text-sm text-gray-900 whitespace-pre-line">
              {patient.medical_history || 'No significant medical history recorded'}
            </dd>
          </div>
          <div className="border-b border-gray-100 pb-4">
            <dt className="text-sm font-medium text-gray-500 mb-1">Allergies</dt>
            <dd className="text-sm text-gray-900 whitespace-pre-line">
              {patient.allergies || 'No known allergies'}
            </dd>
          </div>
          <div className="border-b border-gray-100 pb-4 md:col-span-2">
            <dt className="text-sm font-medium text-gray-500 mb-1">Current Medications</dt>
            <dd className="text-sm text-gray-900 whitespace-pre-line">
              {patient.medications || 'No current medications'}
            </dd>
          </div>
        </div>
      </div>

      {/* Additional Information for IPD Patients */}
      {patient.patient_type === 'ipd' && (
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Admission Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border-b border-gray-100 pb-4">
              <dt className="text-sm font-medium text-gray-500 mb-1">Admission Reason</dt>
              <dd className="text-sm text-gray-900">{patient.admission_reason || 'Not specified'}</dd>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <dt className="text-sm font-medium text-gray-500 mb-1">Ward</dt>
              <dd className="text-sm text-gray-900">{patient.ward || 'Not assigned'}</dd>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <dt className="text-sm font-medium text-gray-500 mb-1">Bed Number</dt>
              <dd className="text-sm text-gray-900">{patient.bed || 'Not assigned'}</dd>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <dt className="text-sm font-medium text-gray-500 mb-1">Attending Doctor</dt>
              <dd className="text-sm text-gray-900">{patient.attending_doctor || 'Not assigned'}</dd>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <dt className="text-sm font-medium text-gray-500 mb-1">Department</dt>
              <dd className="text-sm text-gray-900">{patient.department_name || 'Not assigned'}</dd>
            </div>
          </div>
        </div>
      )}

      {/* For OPD Patients - Recent Appointments */}
      {patient.patient_type === 'opd' && (
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Recent Activity</h4>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              This is an OPD patient. To view appointment history, visit the appointments section.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoTab;