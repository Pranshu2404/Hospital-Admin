import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

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

const AddHodPage = () => {
  const { id } = useParams(); // department id
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Get departmentName from query param
  const query = new URLSearchParams(location.search);
  const departmentName = query.get('departmentName');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch department details with populated HOD
        const deptRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`);
        setDepartment(deptRes.data);

        // Fetch doctors directly by department ID
        const docRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors/department/${id}`);
        setDoctors(docRes.data);
      } catch (err) {
        console.error(err);
        setSuccess('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleSetHod = async (doctorId) => {
    try {
      // Update department using PUT API
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`, {
        head_doctor_id: doctorId
      });
      setSuccess('HOD assigned successfully!');
      // Refetch department to update HOD info
      const deptRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments/${id}`);
      setDepartment(deptRes.data);
    } catch (err) {
      console.error(err);
      setSuccess('Failed to assign HOD');
    }
  };

  if (loading) return (
    <Layout sidebarItems={adminSidebar}>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    </Layout>
  );

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6 min-h-screen bg-gray-50 w-full">
        <div className="bg-white rounded-xl p-6 shadow w-full max-w-full overflow-x-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Assign HOD for {department?.name}
          </h2>
          
          {department?.head_doctor_id && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">Current HOD:</h3>
              <p className="text-sm text-gray-800">
                {department.head_doctor_id.firstName} {department.head_doctor_id.lastName} — {department.head_doctor_id.specialization}
              </p>
            </div>
          )}

          {success && <div className="mb-4 text-green-600 font-medium">{success}</div>}
          <div className="overflow-x-auto">
            <table className="min-w-full w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-6 text-gray-500">No doctors found for this department.</td></tr>
                )}
                {doctors.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {/* <span className={getRoleBadge(member.role)}>{member.role}</span> */}
                        <div className="text-sm text-gray-900">{member.department?.name || '—'}</div>
                        <div className="text-sm text-gray-500">{member.specialization || '—'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-xs">{member.phone}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{member.email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.experience ? `${member.experience} yrs` : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={getShiftBadge(member.shift)}>{member.shift || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(member.status || 'Active')}>{member.status || 'Active'}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      {department?.head_doctor_id?._id === member._id ? (
  <span className="text-green-600 font-semibold">HOD</span>
) : (
  <button
    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
    onClick={() => handleSetHod(member._id)}
  >
    Select as HOD
  </button>
)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddHodPage;
