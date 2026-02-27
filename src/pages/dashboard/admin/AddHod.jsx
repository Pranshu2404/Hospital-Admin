import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { SearchableFormSelect } from '../../../components/common/FormElements';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  Button
} from '../../../components/common/FormElements';

const AddHodPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const deptNameFromQuery = params.get('name');
  const deptIdFromQuery = params.get('id');
  const [deptName, setDeptName] = useState(deptNameFromQuery || '');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', dateOfBirth: '', gender: '',
    address: '', city: '', state: '', zipCode: '', role: 'Doctor', department: deptNameFromQuery || '',
    specialization: '', licenseNumber: '', experience: '', education: '', shift: '',
    emergencyContact: '', emergencyPhone: '', startDate: '', salary: '',
    isFullTime: true, hasInsurance: true, notes: ''
  });

  const [existingDept, setExistingDept] = useState(null);
  const [loading, setLoading] = useState(!!deptIdFromQuery);

  useEffect(() => {
    if (deptIdFromQuery) {
      axios.get(`${import.meta.env.VITE_BACKEND_URL}/departments/${deptIdFromQuery}`)
        .then(res => {
          const dept = res.data;
          setDeptName(dept.name);
          setExistingDept(dept);

          const hod = dept.head_doctor_id;

          if (hod) {
            setFormData({
              firstName: hod.firstName || '',
              lastName: hod.lastName || '',
              email: hod.email || '',
              password: '', // Keep blank for security
              phone: hod.phone || '',
              dateOfBirth: hod.dateOfBirth?.slice(0, 10) || '',
              gender: hod.gender || '',
              address: hod.address || '',
              city: hod.city || '',
              state: hod.state || '',
              zipCode: hod.zipCode || '',
              role: hod.role || 'Doctor',
              department: dept.name || '',
              specialization: hod.specialization || '',
              licenseNumber: hod.licenseNumber || '',
              experience: hod.experience || '',
              education: hod.education || '',
              shift: hod.shift || '',
              emergencyContact: hod.emergencyContact || '',
              emergencyPhone: hod.emergencyPhone || '',
              startDate: hod.startDate?.slice(0, 10) || '',
              salary: hod.salary || '',
              isFullTime: hod.isFullTime ?? true,
              hasInsurance: hod.hasInsurance ?? true,
              notes: hod.notes || ''
            });
          } else {
            // Department has no HOD, just prefill department
            setFormData(prev => ({ ...prev, department: dept.name }));
          }
        })
        .catch(err => console.error('Error fetching department:', err))
        .finally(() => setLoading(false));
    }
  }, [deptIdFromQuery]);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting form data:', formData);
      const doctorRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/doctors`, formData);
      const doctorId = doctorRes.data.doctor._id;
      console.log('Doctor created:', doctorRes);
      if (deptNameFromQuery) {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/departments`, {
          name: deptNameFromQuery,
          head_doctor_id: doctorId
        });
        alert('HOD added and department created successfully');
        navigate(-1);
      }
    } catch (err) {
      console.error('Error:', err);
      alert(err.response?.data?.error || 'Failed to process');
    }
  };

  const handleUpdate = async () => {
    try {
      const doctorRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/doctors`, formData);
      const doctorId = doctorRes.data._id;

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/departments/${deptIdFromQuery}`, {
        head_doctor_id: doctorId
      });
      alert('Department HOD updated successfully');
      navigate(-1);
    } catch (err) {
      console.error('Error updating HOD:', err);
      alert(err.response?.data?.error || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/departments/${deptIdFromQuery}`);
      alert('Department deleted successfully');
      navigate(-1);
    } catch (err) {
      console.error('Error deleting department:', err);
      alert('Failed to delete department');
    }
  };

  const shiftOptions = [
    { value: 'Morning', label: 'Morning (7 AM - 3 PM)' },
    { value: 'Evening', label: 'Evening (3 PM - 11 PM)' },
    { value: 'Night', label: 'Night (11 PM - 7 AM)' },
    { value: 'Rotating', label: 'Rotating Shifts' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">
              {deptName ? `Add HOD for ${deptName}` : `Edit HOD for ${deptName}`}
            </h2>
            <p className="text-gray-600 mt-1">Enter head of department information</p>
          </div>

          {loading ? (
            <div className="p-6 text-gray-500">Loading...</div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="First Name" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} required />
                  <FormInput label="Last Name" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} required />
                  <FormInput label="Email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required />
                  <FormInput label="Password" type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required />
                  <FormInput label="Phone" type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} required />
                  <FormInput label="DOB" type="date" value={formData.dateOfBirth} onChange={e => handleInputChange('dateOfBirth', e.target.value)} required />
                  <SearchableFormSelect label="Gender" value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)} options={genderOptions} required />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormTextarea label="Address" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} rows={3} className="md:col-span-2" />
                  <FormInput label="City" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
                  <FormInput label="State" value={formData.state} onChange={e => handleInputChange('state', e.target.value)} />
                  <FormInput label="ZIP Code" value={formData.zipCode} onChange={e => handleInputChange('zipCode', e.target.value)} />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Department" value={formData.department} readOnly />
                  <FormInput label="Specialization" value={formData.specialization} onChange={e => handleInputChange('specialization', e.target.value)} />
                  <FormInput label="License Number" value={formData.licenseNumber} onChange={e => handleInputChange('licenseNumber', e.target.value)} required />
                  <FormInput label="Experience (Years)" type="number" value={formData.experience} onChange={e => handleInputChange('experience', e.target.value)} />
                  <SearchableFormSelect label="Shift" value={formData.shift} onChange={e => handleInputChange('shift', e.target.value)} options={shiftOptions} required />
                  <FormTextarea label="Education" value={formData.education} onChange={e => handleInputChange('education', e.target.value)} rows={3} className="md:col-span-2" />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Start Date" type="date" value={formData.startDate} onChange={e => handleInputChange('startDate', e.target.value)} required />
                  <FormInput label="Salary" type="number" value={formData.salary} onChange={e => handleInputChange('salary', e.target.value)} />
                  <FormCheckbox label="Full-time Employee" checked={formData.isFullTime} onChange={e => handleInputChange('isFullTime', e.target.checked)} />
                  <FormCheckbox label="Has Health Insurance" checked={formData.hasInsurance} onChange={e => handleInputChange('hasInsurance', e.target.checked)} />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Contact Name" value={formData.emergencyContact} onChange={e => handleInputChange('emergencyContact', e.target.value)} />
                  <FormInput label="Contact Phone" type="tel" value={formData.emergencyPhone} onChange={e => handleInputChange('emergencyPhone', e.target.value)} />
                </div>
              </div>

              <div className="mb-8">
                <FormTextarea label="Additional Notes" value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} rows={3} />
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                {deptNameFromQuery ? (
                  <Button variant="primary" type="submit">Add HOD</Button>
                ) : (
                  <>
                    <Button variant="primary" type="button" onClick={handleUpdate}>Update HOD</Button>
                    <Button variant="danger" type="button" onClick={handleDelete}>Delete Department</Button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AddHodPage;
