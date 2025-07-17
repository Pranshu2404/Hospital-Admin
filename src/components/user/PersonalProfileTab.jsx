import { useState } from 'react';
import axios from 'axios';
import { Button } from '../common/FormElements';
import { EditIcon } from '../common/Icons';
import ProfileInfoRow from './ProfileInfoRow';

const PersonalProfileTab = ({ hospitalData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    hospitalName: hospitalData?.hospitalName || '',
    adminName: hospitalData?.name || '',
    email: hospitalData?.email || '',
    phone: hospitalData?.contact || '',
    address: hospitalData?.address || '',
    registryNo: hospitalData?.registryNo || '',
    hospitalID: hospitalData?.hospitalID || '',
    companyName: hospitalData?.companyName || '',
    companyNumber: hospitalData?.companyNumber || '',
    fireNOC: hospitalData?.fireNOC || '',
    healthBima: hospitalData?.healthBima || '',
    additionalInfo: hospitalData?.additionalInfo || ''
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/hospitals/${hospitalData._id}/details`,
        {
          hospitalName: profileData.hospitalName,
          name: profileData.adminName,
          email: profileData.email,
          contact: profileData.phone,
          address: profileData.address,
          registryNo: profileData.registryNo,
          companyName: profileData.companyName,
          companyNumber: profileData.companyNumber,
          fireNOC: profileData.fireNOC,
          healthBima: profileData.healthBima,
          additionalInfo: profileData.additionalInfo
        }
      );
      alert('Details updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating hospital details:', err);
      alert('Failed to update details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset back to original hospitalData
    setProfileData({
      hospitalName: hospitalData?.hospitalName || '',
      adminName: hospitalData?.name || '',
      email: hospitalData?.email || '',
      phone: hospitalData?.contact || '',
      address: hospitalData?.address || '',
      registryNo: hospitalData?.registryNo || '',
      hospitalID: hospitalData?.hospitalID || '',
      companyName: hospitalData?.companyName || '',
      companyNumber: hospitalData?.companyNumber || '',
      fireNOC: hospitalData?.fireNOC || '',
      healthBima: hospitalData?.healthBima || '',
      additionalInfo: hospitalData?.additionalInfo || ''
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Hospital & Admin Information</h3>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <EditIcon /> Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" onClick={handleCancel}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Hospital Info */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Hospital Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileInfoRow label="Hospital Name" value={profileData.hospitalName} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, hospitalName: val }))} />
          <ProfileInfoRow label="Registry No" value={profileData.registryNo} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, registryNo: val }))} />
          <ProfileInfoRow label="Hospital ID" value={profileData.hospitalID} isEditing={false} />
          <ProfileInfoRow label="Address" value={profileData.address} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, address: val }))} />
          <ProfileInfoRow label="Company Name" value={profileData.companyName} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, companyName: val }))} />
          <ProfileInfoRow label="Company Number" value={profileData.companyNumber} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, companyNumber: val }))} />
        </div>
      </div>

      {/* Admin Info */}
      <div className="mb-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Admin Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileInfoRow label="Name" value={profileData.adminName} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, adminName: val }))} />
          <ProfileInfoRow label="Email" value={profileData.email} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, email: val }))} />
          <ProfileInfoRow label="Contact" value={profileData.phone} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, phone: val }))} />
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Additional Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileInfoRow label="Fire NOC" value={profileData.fireNOC} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, fireNOC: val }))} />
          <ProfileInfoRow label="Health Bima Details" value={profileData.healthBima} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, healthBima: val }))} />
          <ProfileInfoRow label="Additional Info" value={profileData.additionalInfo} isEditing={isEditing} onChange={(val) => setProfileData(prev => ({ ...prev, additionalInfo: val }))} className="md:col-span-2" />
        </div>
      </div>
    </div>
  );
};

export default PersonalProfileTab;
