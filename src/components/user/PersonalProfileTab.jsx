import { useState } from 'react';
import { Button } from '../common/FormElements';
import { EditIcon } from '../common/Icons';
import ProfileInfoRow from './ProfileInfoRow';

const PersonalProfileTab = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@hospital.com',
    phone: '+1 234-567-8900',
    department: 'Administration',
    position: 'Chief Medical Officer',
    employeeId: 'EMP-001',
    dateJoined: '2020-06-15',
    specialization: 'General Medicine',
    licenseNumber: 'MD-12345',
    address: '123 Medical Drive',
    city: 'New York',
    state: 'NY',
    zipCode: '10001'
  });

  const handleSave = () => {
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any changes
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <EditIcon />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileInfoRow
            label="First Name"
            value={profileData.firstName}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, firstName: value }))}
          />
          <ProfileInfoRow
            label="Last Name"
            value={profileData.lastName}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, lastName: value }))}
          />
          <ProfileInfoRow
            label="Email"
            value={profileData.email}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, email: value }))}
          />
          <ProfileInfoRow
            label="Phone"
            value={profileData.phone}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, phone: value }))}
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Professional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileInfoRow
            label="Employee ID"
            value={profileData.employeeId}
            isEditing={false}
          />
          <ProfileInfoRow
            label="Department"
            value={profileData.department}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, department: value }))}
          />
          <ProfileInfoRow
            label="Position"
            value={profileData.position}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, position: value }))}
          />
          <ProfileInfoRow
            label="Date Joined"
            value={profileData.dateJoined}
            isEditing={false}
          />
          <ProfileInfoRow
            label="Specialization"
            value={profileData.specialization}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, specialization: value }))}
          />
          <ProfileInfoRow
            label="License Number"
            value={profileData.licenseNumber}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, licenseNumber: value }))}
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Address Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileInfoRow
            label="Address"
            value={profileData.address}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, address: value }))}
            className="md:col-span-2"
          />
          <ProfileInfoRow
            label="City"
            value={profileData.city}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, city: value }))}
          />
          <ProfileInfoRow
            label="State"
            value={profileData.state}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, state: value }))}
          />
          <ProfileInfoRow
            label="ZIP Code"
            value={profileData.zipCode}
            isEditing={isEditing}
            onChange={(value) => setProfileData(prev => ({ ...prev, zipCode: value }))}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalProfileTab;
