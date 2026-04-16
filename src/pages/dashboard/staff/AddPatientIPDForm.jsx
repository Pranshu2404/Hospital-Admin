import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormInput, FormSelect, FormTextarea, Button } from '../../../components/common/FormElements';
import { SearchableFormSelect } from '../../../components/common/FormElements';
import axios from 'axios';
import { FaUser, FaCloudUploadAlt, FaTimes, FaIdCard } from 'react-icons/fa';
import { addPatientToOffline, checkOfflinePatientByPhone } from '../../../services/offlineDB';
import { useOfflineSync } from '../../../hooks/useOfflineSync';
import { WifiOffIcon } from 'lucide-react';

const AddPatientIPDForm = () => {
  const navigate = useNavigate();
  const { online, syncStats, triggerSync } = useOfflineSync();
  
  const [formData, setFormData] = useState({
    salutation: '',
    firstName: '',
    middleName: '',
    lastName: '',
    patient_image: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    village: '',
    district: '',
    tehsil: '',
    emergencyContact: '',
    emergencyPhone: '',
    ward: '',
    bed: '',
    admissionDate: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    bloodGroup: '',
    aadhaarNumber: ''
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = {
    headers: {
      "X-CSCAPI-KEY": import.meta.env.VITE_CSC_API_KEY,
    },
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/patients/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, patient_image: response.data.imageUrl }));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, patient_image: '' }));
  };

  const formatAadhaarNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
  };

  const handleAadhaarChange = (value) => {
    const formatted = formatAadhaarNumber(value);
    setFormData(prev => ({ ...prev, aadhaarNumber: formatted }));
  };

  // Check for duplicate patient
  const checkDuplicatePatient = async (phone) => {
    if (!online) {
      // Offline: check local IndexedDB
      const existing = await checkOfflinePatientByPhone(phone);
      if (existing) {
        return { exists: true, patient: existing, isOffline: true };
      }
      return { exists: false };
    }
    
    // Online: check server
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/patients/check-duplicate`, {
        params: { phone }
      });
      return { exists: response.data.exists, patient: response.data.patient, isOffline: false };
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return { exists: false };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.phone || !formData.dateOfBirth) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for duplicate
      const duplicateCheck = await checkDuplicatePatient(formData.phone);
      
      if (duplicateCheck.exists) {
        const action = confirm(
          `A patient with phone number ${formData.phone} already exists.\n\n` +
          `Existing: ${duplicateCheck.patient.first_name} ${duplicateCheck.patient.last_name || ''}\n` +
          `Do you want to continue adding this new patient?`
        );
        if (!action) {
          setIsSubmitting(false);
          return;
        }
      }

      const patientData = {
        salutation: formData.salutation,
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        patient_image: formData.patient_image,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dateOfBirth,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        village: formData.village,
        district: formData.district,
        tehsil: formData.tehsil,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone,
        ward: formData.ward,
        bed: formData.bed,
        admission_date: formData.admissionDate,
        medical_history: formData.medicalHistory,
        allergies: formData.allergies,
        medications: formData.medications,
        blood_group: formData.bloodGroup,
        aadhaar_number: formData.aadhaarNumber?.replace(/\s/g, ''),
        patient_type: "ipd"
      };

      if (online) {
        // Online mode - save directly
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/patients`, patientData);
        console.log('✅ Patient added online:', response.data);
        alert('Patient added successfully!');
        navigate('/dashboard/staff/patient-list');
      } else {
        // Offline mode - save to IndexedDB
        const localId = await addPatientToOffline(patientData);
        console.log('💾 Patient saved offline with ID:', localId);
        alert(`Patient saved offline!\n\nData will sync automatically when internet connection is restored.\nPending syncs: ${syncStats.pendingPatients + syncStats.pendingAppointments + 1}`);
        navigate('/dashboard/staff/patient-list');
      }
      
    } catch (err) {
      console.error('Error:', err);
      
      // If online save fails due to network, offer offline save
      if (online && err.message === 'Network Error') {
        const saveOffline = confirm('Network error. Would you like to save this patient offline and sync later?');
        if (saveOffline) {
          const patientData = {
            salutation: formData.salutation,
            first_name: formData.firstName,
            middle_name: formData.middleName,
            last_name: formData.lastName,
            patient_image: formData.patient_image,
            email: formData.email,
            phone: formData.phone,
            gender: formData.gender,
            dob: formData.dateOfBirth,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            village: formData.village,
            district: formData.district,
            tehsil: formData.tehsil,
            emergency_contact: formData.emergencyContact,
            emergency_phone: formData.emergencyPhone,
            ward: formData.ward,
            bed: formData.bed,
            admission_date: formData.admissionDate,
            medical_history: formData.medicalHistory,
            allergies: formData.allergies,
            medications: formData.medications,
            blood_group: formData.bloodGroup,
            aadhaar_number: formData.aadhaarNumber?.replace(/\s/g, ''),
            patient_type: "ipd"
          };
          await addPatientToOffline(patientData);
          alert('Patient saved offline! Will sync when connection returns.');
          navigate('/dashboard/staff/patient-list');
        }
      } else {
        alert(err.response?.data?.error || 'Failed to add patient.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch States on component mount (only when online)
  useEffect(() => {
    const fetchStates = async () => {
      if (!online) return; // Skip API call when offline
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/countries/${import.meta.env.VITE_COUNTRY_CODE}/states`,
          config
        );
        setStates(response.data);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    fetchStates();

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayDate = `${year}-${month}-${day}`;

    setFormData(prev => ({
      ...prev,
      admissionDate: todayDate
    }));
  }, [online]); // Re-run when online status changes

  const fetchCities = async (stateIso) => {
    if (!stateIso) {
      setCities([]);
      return;
    }
    
    if (!online) return; // Skip API call when offline
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/countries/${import.meta.env.VITE_COUNTRY_CODE}/states/${stateIso}/cities`,
        config
      );
      setCities(response.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'state' && online) {
      // Only fetch cities online
      fetchCities(value);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  };

  const salutationOptions = [
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Ms.', label: 'Ms.' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Dr.', label: 'Dr.' },
    { value: 'Prof.', label: 'Prof.' },
    { value: 'Baby', label: 'Baby' },
    { value: 'Master', label: 'Master' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' }
  ];

  const stateOptions = states.map(state => ({
    value: state.iso2,
    label: state.name
  }));

  const cityOptions = cities.map(city => ({
    value: city.name,
    label: city.name
  }));

  return (
    <>
      <div className="p-1">
        {/* Offline Mode Notice */}
        {!online && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
            <WifiOffIcon className="text-amber-600 text-xl" />
            <div>
              <span className="font-medium text-amber-800">Offline Mode Active</span>
              <p className="text-sm text-amber-700">
                You are currently offline. Patient data will be saved locally and synced when connection resumes.
                {syncStats.pendingPatients > 0 && ` (${syncStats.pendingPatients} patients pending sync)`}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Add Patient</h2>
            <p className="text-gray-600 mt-1">
              Enter patient details for admission
              {!online && <span className="text-amber-600 ml-2">(Offline Mode - Will sync later)</span>}
              {online && syncStats.pendingPatients > 0 && (
                <span className="text-teal-600 ml-2">({syncStats.pendingPatients} pending in queue)</span>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

              {/* Image Upload Section */}
              <div className="mb-6 flex justify-center">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                      {formData.patient_image ? (
                        <img
                          src={formData.patient_image}
                          alt="Patient"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-4xl text-slate-400" />
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                        </div>
                      )}
                    </div>

                    {formData.patient_image ? (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full shadow-md hover:bg-red-600 transition-colors"
                        title="Remove Photo"
                      >
                        <FaTimes size={12} />
                      </button>
                    ) : (
                      <label
                        className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full shadow-md hover:bg-teal-700 transition-colors cursor-pointer"
                        title="Upload Photo"
                      >
                        <FaCloudUploadAlt size={14} />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Allowed: JPG, PNG</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SearchableFormSelect
                  label="Salutation"
                  value={formData.salutation}
                  onChange={(e) => handleInputChange('salutation', e.target.value)}
                  options={salutationOptions}
                  required
                />
                <FormInput 
                  label="First Name" 
                  value={formData.firstName} 
                  onChange={(e) => handleInputChange('firstName', e.target.value)} 
                  required 
                />
                <FormInput 
                  label="Middle Name" 
                  value={formData.middleName} 
                  onChange={(e) => handleInputChange('middleName', e.target.value)} 
                />
                <FormInput 
                  label="Last Name" 
                  value={formData.lastName} 
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
                <FormInput 
                  label="Email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <FormInput 
                  label="Phone Number" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  required 
                  maxLength={10}
                  inputMode="numeric"
                  pattern="^[6-9]\d{9}$"
                  title="10 digit Indian mobile number starting with 6-9"
                />
                <FormInput 
                  label="Date of Birth" 
                  type="date" 
                  value={formData.dateOfBirth} 
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} 
                  required 
                />
                <SearchableFormSelect 
                  label="Gender" 
                  value={formData.gender} 
                  onChange={(e) => handleInputChange('gender', e.target.value)} 
                  options={genderOptions} 
                  required
                />
                <div className="md:col-span-2">
                  <div className="relative">
                    <FormInput
                      label="Aadhaar Number"
                      type="text"
                      value={formData.aadhaarNumber}
                      onChange={(e) => handleAadhaarChange(e.target.value)}
                      maxLength="14"
                      placeholder="XXXX XXXX XXXX"
                      icon={<FaIdCard className="text-gray-400" />}
                    />
                    {formData.aadhaarNumber && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span>Aadhaar: {formData.aadhaarNumber}</span>
                        {formData.aadhaarNumber.replace(/\s/g, '').length !== 12 && (
                          <span className="text-amber-600">(Must be 12 digits)</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextarea 
                  label="Address" 
                  value={formData.address} 
                  onChange={(e) => handleInputChange('address', e.target.value)} 
                  rows={3} 
                  className="md:col-span-2" 
                />
                
                {/* State Field - Dropdown when online, Text input when offline */}
                {online ? (
                  <SearchableFormSelect 
                    label="State"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    options={stateOptions}
                  />
                ) : (
                  <FormInput
                    label="State"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Enter state name"
                  />
                )}

                {/* City Field - Dropdown when online AND state selected, Text input when offline */}
                {online && formData.state ? (
                  <SearchableFormSelect 
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    options={cityOptions}
                    disabled={!formData.state}
                  />
                ) : (
                  <FormInput
                    label="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder={online ? "Select a state first" : "Enter city name"}
                    disabled={online && !formData.state}
                  />
                )}

                <FormInput 
                  label="District" 
                  value={formData.district} 
                  onChange={(e) => handleInputChange('district', e.target.value)} 
                />
                <FormInput 
                  label="Tehsil" 
                  value={formData.tehsil} 
                  onChange={(e) => handleInputChange('tehsil', e.target.value)} 
                />
                <FormInput 
                  label="Village" 
                  value={formData.village} 
                  onChange={(e) => handleInputChange('village', e.target.value)} 
                />
                <FormInput 
                  label="ZIP Code" 
                  value={formData.zipCode} 
                  onChange={(e) => handleInputChange('zipCode', e.target.value)} 
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput 
                  label="Contact Name" 
                  value={formData.emergencyContact} 
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)} 
                />
                <FormInput 
                  label="Contact Phone" 
                  type="tel" 
                  value={formData.emergencyPhone} 
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  maxLength={10}
                />
              </div>
            </div>

            {/* Admission Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admission Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput 
                  label="Admission Date" 
                  type="date" 
                  value={formData.admissionDate} 
                  onChange={(e) => handleInputChange('admissionDate', e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput 
                  label="Medical History" 
                  value={formData.medicalHistory} 
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)} 
                />
                <FormInput 
                  label="Allergies" 
                  value={formData.allergies} 
                  onChange={(e) => handleInputChange('allergies', e.target.value)} 
                />
                <FormInput 
                  label="Medications" 
                  value={formData.medications} 
                  onChange={(e) => handleInputChange('medications', e.target.value)} 
                />
                <SearchableFormSelect 
                  label="Blood Group" 
                  value={formData.bloodGroup} 
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)} 
                  options={bloodGroupOptions} 
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button 
                variant="secondary" 
                type="button"
                onClick={() => navigate('/dashboard/staff/patient-list')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </div>
                ) : (
                  online ? 'Add Patient' : 'Save Offline'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddPatientIPDForm;