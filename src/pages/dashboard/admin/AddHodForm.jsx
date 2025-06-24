




import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  Button
} from '../../../components/common/FormElements';

const AddHodForm = () => {
  const { deptId } = useParams();

  const formattedDept = deptId
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';

  const [formData, setFormData] = useState({     // correct code
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    role: 'Doctor',
    department: formattedDept,
    specialization: '',
    licenseNumber: '',
    experience: '',
    education: '',
    shift: '',
    emergencyContact: '',
    emergencyPhone: '',
    startDate: '',
    salary: '',
    isFullTime: true,
    hasInsurance: true,
    notes: ''
  });



  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/doctors`,
        formData
      );
      console.log('✅ Doctor added successfully:', response.data);
      alert('Doctor added successfully!');
    } catch (err) {
      console.error('❌ Error adding doctor:', err.response?.data || err.message);
      alert(err.response?.data?.error || 'Failed to add doctor.');
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
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add HOD of {formattedDept}</h2>
          <p className="text-gray-600 mt-1">Enter head of department information</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Personal Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="First Name" value={formData.firstName} onChange={e => handleInputChange('firstName', e.target.value)} required />
              <FormInput label="Last Name" value={formData.lastName} onChange={e => handleInputChange('lastName', e.target.value)} required />
              <FormInput label="Email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required />
              <FormInput label="Password" type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required />
              <FormInput label="Phone" type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} required />
              <FormInput label="DOB" type="date" value={formData.dateOfBirth} onChange={e => handleInputChange('dateOfBirth', e.target.value)} required />
              <FormSelect label="Gender" value={formData.gender} onChange={e => handleInputChange('gender', e.target.value)} options={genderOptions} required />
            </div>
          </div>

          {/* Address */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea label="Address" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} rows={3} className="md:col-span-2" />
              <FormInput label="City" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
              <FormInput label="State" value={formData.state} onChange={e => handleInputChange('state', e.target.value)} />
              <FormInput label="ZIP Code" value={formData.zipCode} onChange={e => handleInputChange('zipCode', e.target.value)} />
            </div>
          </div>

          {/* Professional Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Department" value={formData.department} readOnly />
              <FormInput label="Specialization" value={formData.specialization} onChange={e => handleInputChange('specialization', e.target.value)} />
              <FormInput label="License Number" value={formData.licenseNumber} onChange={e => handleInputChange('licenseNumber', e.target.value)} required />
              <FormInput label="Experience (Years)" type="number" value={formData.experience} onChange={e => handleInputChange('experience', e.target.value)} />
              <FormSelect label="Shift" value={formData.shift} onChange={e => handleInputChange('shift', e.target.value)} options={shiftOptions} required />
              <FormTextarea label="Education" value={formData.education} onChange={e => handleInputChange('education', e.target.value)} rows={3} className="md:col-span-2" />
            </div>
          </div>

          {/* Employment Info */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Start Date" type="date" value={formData.startDate} onChange={e => handleInputChange('startDate', e.target.value)} required />
              <FormInput label="Salary" type="number" value={formData.salary} onChange={e => handleInputChange('salary', e.target.value)} />
              <FormCheckbox label="Full-time Employee" checked={formData.isFullTime} onChange={e => handleInputChange('isFullTime', e.target.checked)} />
              <FormCheckbox label="Has Health Insurance" checked={formData.hasInsurance} onChange={e => handleInputChange('hasInsurance', e.target.checked)} />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Contact Name" value={formData.emergencyContact} onChange={e => handleInputChange('emergencyContact', e.target.value)} />
              <FormInput label="Contact Phone" type="tel" value={formData.emergencyPhone} onChange={e => handleInputChange('emergencyPhone', e.target.value)} />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <FormTextarea label="Additional Notes" value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} rows={3} />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="secondary" type="button">Cancel</Button>
            <Button variant="primary" type="submit">Add HOD</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHodForm;



// import { useState, useEffect } from 'react';
// import { Button } from '../../../components/common/FormElements';
// import { Input } from '../../../components/common/Input';
// import {
//   Select, SelectTrigger, SelectValue, SelectContent, SelectItem
// } from '../../../components/common/Select';
// import { useNavigate } from 'react-router-dom';
// import { HiUsers } from 'react-icons/hi';
// import { FaPlus } from 'react-icons/fa';
// import axios from 'axios';

// const HodList = () => {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [hods, setHods] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [roleFilter, setRoleFilter] = useState('all');
//   const [deptFilter, setDeptFilter] = useState('all');

//   useEffect(() => {
//     const fetchHods = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/hods`);
//         setHods(res.data);
//       } catch (e) {
//         console.error('Failed to fetch HODs:', e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHods();
//   }, []);

//   const filtered = hods.filter(h =>
//     (`${h.first_name} ${h.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
//      h.department?.toLowerCase().includes(searchTerm.toLowerCase())) &&
//     (roleFilter === 'all' || h.role?.toLowerCase() === roleFilter) &&
//     (deptFilter === 'all' || h.department?.toLowerCase() === deptFilter)
//   );

//   return (
//     <div className="p-6">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//         {/* Top Header */}
//         <div className="flex justify-between items-center px-6 py-6 border-b border-gray-100">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">HODs List</h2>
//             <p className="text-gray-600 mt-1">Manage Head of Departments and assigned doctors</p>
//           </div>
//           <Button
//             className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
//             onClick={() => navigate('/dashboard/admin/add-hod')}
//           >
//             <FaPlus />
//             Add HOD
//           </Button>
//         </div>

//         {/* Search and Filters */}
//         <div className="flex flex-wrap items-center gap-4 px-6 py-4">
//           <Input
//             className="flex-1 min-w-[250px]"
//             placeholder="Search by name or department..."
//             value={searchTerm}
//             onChange={e => setSearchTerm(e.target.value)}
//           />
//           <Select value={roleFilter} onValueChange={setRoleFilter}>
//             <SelectTrigger className="w-[150px]">
//               <SelectValue placeholder="All Roles" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Roles</SelectItem>
//               <SelectItem value="hod">HOD</SelectItem>
//               <SelectItem value="doctor">Doctor</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={deptFilter} onValueChange={setDeptFilter}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="All Departments" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Departments</SelectItem>
//               <SelectItem value="cardiology">Cardiology</SelectItem>
//               <SelectItem value="neurology">Neurology</SelectItem>
//               <SelectItem value="orthopedics">Orthopedics</SelectItem>
//               {/* More departments can be added dynamically */}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Table / Empty State */}
//         {loading ? (
//           <div className="text-center text-gray-500 py-10">Loading...</div>
//         ) : filtered.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-center">
//             <HiUsers size={48} className="mb-2" />
//             <p className="font-semibold">No HODs found</p>
//             <p className="text-sm text-gray-400">Get started by adding a new HOD.</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto px-6 pb-6">
//             <table className="min-w-full text-sm text-gray-700 table-auto">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
//                   <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Role & Department</th>
//                   <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Contact</th>
//                   <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Experience</th>
//                   <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Shift</th>
//                   <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((hod) => (
//                   <tr key={hod._id} className="border-b hover:bg-gray-50">
//                     <td className="px-6 py-4">{`${hod.first_name} ${hod.last_name}`}</td>
//                     <td className="px-6 py-4">{`${hod.role || 'HOD'} - ${hod.department}`}</td>
//                     <td className="px-6 py-4">{hod.phone || '—'}</td>
//                     <td className="px-6 py-4">{hod.experience || '—'} yrs</td>
//                     <td className="px-6 py-4">{hod.shift || '—'}</td>
//                     <td className="px-6 py-4">
//                       <span className="text-green-600 font-medium">Active</span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/admin/hod/${hod._id}`)}>
//                         View
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HodList;

