import { useState, useEffect, useRef } from 'react';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, EditIcon, DeleteIcon, FilterIcon, UploadIcon, XIcon } from '../common/Icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Papa from 'papaparse'; // NEW: Import PapaParse

const DoctorNurseList = ({ setCurrentPage }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [staff, setStaff] = useState([]);

    // Upload modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fileInputRef = useRef(null);

  const fetchDoctors = async () => {
    try {
      const cacheBust = `?_cacheBust=${new Date().getTime()}`;
      const url = `${import.meta.env.VITE_BACKEND_URL}/doctors${cacheBust}`;
      const res = await axios.get(url);
      setStaff(res.data);
    } catch (err) {
      console.error('Failed to refresh doctor list:', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/doctors/bulk-add`,
            results.data
          );
          setUploadSuccess(response.data.message || 'Doctors uploaded successfully!');
          fetchDoctors();
          setTimeout(() => setIsModalOpen(false), 1500); // Close modal after success
        } catch (apiError) {
          setUploadError(apiError.response?.data?.message || 'An error occurred.');
        } finally {
          event.target.value = null;
        }
      },
      error: (error) => {
        setUploadError(`CSV Parsing Error: ${error.message}`);
        event.target.value = null;
      },
    });
  };

  // Download demo CSV
  const downloadDemoCSV = () => {
  const csvContent =
  'firstName,lastName,email,password,phone,role,department,specialization,licenseNumber,experience,paymentType,amount,isFullTime,dateOfBirth,gender,address,city,state,zipCode,contractStartDate,contractEndDate,visitsPerWeek,workingDaysPerWeek,aadharNumber,panNumber,notes\n' +
  'Sanjay,Gupta,sanjay.gupta@hospital.com,newpass123,9123456780,Doctor,Cardiology,Orthopedics,NEWTESTLIC005,14,Fee per Visit,1500,false,03-12-1984,Male,22A Lajpat Nagar,Kanpur,Uttar Pradesh,208005,2025-02-01,2025-12-31,3,4,1234-5678-9012,ABCDE1234F,Experienced Cardiologist';

  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'demo_doctors.csv';
  a.click();
  URL.revokeObjectURL(url);
};



  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'bg-green-100 text-green-800',
      'On Leave': 'bg-yellow-100 text-yellow-800',
      'Inactive': 'bg-red-100 text-red-800',
      'Suspended': 'bg-red-100 text-red-800'
    };

    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getRoleBadge = (role) => {
    return role === 'Doctor'
      ? 'px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full'
      : 'px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full';
  };

  const getShiftBadge = (shift) => {
    const shiftClasses = {
      'Morning': 'bg-orange-100 text-orange-800',
      'Evening': 'bg-indigo-100 text-indigo-800',
      'Night': 'bg-gray-100 text-gray-800',
      'Rotating': 'bg-teal-100 text-teal-800'
    };

    return `px-2 py-1 text-xs font-medium rounded-full ${shiftClasses[shift] || 'bg-gray-100 text-gray-800'}`;
  };

  // const getInitials = (name) => {
  //   return name.split(' ').map(n => n[0]).join('');
  // };

  // const departments = [...new Set(staff.map(member => member.department))];
  const departments = [
  ...new Map(
    staff
      .filter(member => member.department) // only those with departments
      .map(member => [member.department._id || member.department, member.department])
  ).values()
];

  return (
    <div className="p-3">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Doctors List</h2>
              <p className="text-gray-600 mt-1">Manage doctors, nurses, and medical staff</p>
            </div>
            {/* MODIFIED: Added a container for buttons */}
            <div className="flex items-center gap-2">
              {/* NEW: Bulk Upload Button */}
              <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                <UploadIcon />
                Bulk Upload
              </Button>

              <Button
                variant="primary"
                onClick={() => navigate('/dashboard/admin/add-doctor')}
              >
                <PlusIcon />
                Add Doctor
              </Button>
            </div>
          </div>

          {/* NEW: Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".csv"
          />

          {/* NEW: Upload status messages */}
          {uploadSuccess && <div className="m-2 p-2 text-sm text-green-800 bg-green-100 rounded-md">{uploadSuccess}</div>}
          {uploadError && <div className="m-2 p-2 text-sm text-red-800 bg-red-100 rounded-md">{uploadError}</div>}
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, specialization, or department..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Roles</option>
                <option value="Doctor">Doctors</option>
                <option value="Nurse">Nurses</option>
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  // The key prop MUST be here
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm">
                <FilterIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Department</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-sm font-semibold text-teal-700">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          License: {member.licenseNumber || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {/* <span className={getRoleBadge(member.role)}>{member.role}</span> */}
                      <div className="text-sm text-gray-900">{member.department?.name|| '—'}</div>
                      <div className="text-sm text-gray-500">{member.specialization || '—'}</div>
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate max-w-xs">{member.phone}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{member.email}</div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.experience ? `${member.experience} yrs` : 'N/A'}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={getShiftBadge(member.shift)}>{member.shift || 'N/A'}</span>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(member.status || 'Active')}>{member.status || 'Active'}</span>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="text-teal-600 hover:text-teal-900 p-1 rounded"
                        onClick={() => navigate(`/dashboard/admin/doctor-profile/${member._id}`)}
                      >
                        View
                      </button>

                      {/* <button className="text-gray-400 hover:text-gray-600 p-1 rounded"><EditIcon /></button> */}
                      <button
                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                        onClick={() => navigate(`/dashboard/admin/edit-doctor/${member._id}`)}
                      >
                        <EditIcon />
                      </button>

                      {/* <button
                className="text-teal-600 hover:text-teal-900 p-1 rounded"
                onClick={() => navigate(`/dashboard/admin/doctor-profile/${member._id}`)}
              >
                View
              </button> */}
                      <button className="text-red-400 hover:text-red-600 p-1 rounded"><DeleteIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {staff.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Doctors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by adding a new Doctor.'}
              </p>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Bulk Upload Doctors</h3>
                <button onClick={() => setIsModalOpen(false)}>
                  <XIcon />
                </button>
              </div>

              <p className="text-gray-600 mb-4">Upload doctors in bulk using the CSV format below:</p>
              <div className="bg-gray-50 p-4 rounded-md border overflow-x-auto">
  <table className="min-w-full border border-gray-200 text-xs">
    <thead className="bg-gray-100">
      <tr>
        {[
    'firstName', 'lastName', 'email', 'password', 'phone', 'role', 'department', 'specialization',
    'licenseNumber', 'experience', 'paymentType', 'amount', 'isFullTime', 'dateOfBirth', 'gender',
    'address', 'city', 'state', 'zipCode', 'contractStartDate', 'contractEndDate', 'visitsPerWeek',
    'workingDaysPerWeek', 'aadharNumber', 'panNumber', 'notes'
  ].map((header, index) => (
          <th key={index} className="border px-2 py-1 text-gray-700 font-medium text-left">
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      <tr className="bg-white">
        {[
  'Sanjay', 'Gupta', 'sanjay.gupta@hospital.com', 'newpass123', '9123456780', 'Doctor', 'Cardiology', 'Orthopedics',
  'NEWTESTLIC005', '14', 'Fee per Visit', '1500', 'false', '03-12-1984', 'Male', '22A Lajpat Nagar',
  'Kanpur', 'Uttar Pradesh', '208005', '2025-02-01', '2025-12-31', '3', '4', '1234-5678-9012', 'ABCDE1234F', 'Experienced Cardiologist'
]
.map((value, index) => (
          <td key={index} className="border px-2 py-1 text-gray-600 truncate max-w-[150px]">
            {value}
          </td>
        ))}
      </tr>
    </tbody>
  </table>
</div>


              <div className="flex gap-3 mb-4 mt-4">
                <Button variant="outline" onClick={downloadDemoCSV}>Download Demo CSV</Button>
                <Button variant="primary" onClick={() => fileInputRef.current.click()}>Upload CSV</Button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".csv"
              />

              {uploadSuccess && <div className="mt-2 p-2 text-green-800 bg-green-100 rounded">{uploadSuccess}</div>}
              {uploadError && <div className="mt-2 p-2 text-red-800 bg-red-100 rounded">{uploadError}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorNurseList;
