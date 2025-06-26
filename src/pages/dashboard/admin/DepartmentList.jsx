import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const DepartmentList = () => {
  const [hods, setHods] = useState([]);

  useEffect(() => {
    const fetchHods = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments/hods/all`);
        setHods(res.data);
      } catch (err) {
        console.error('Failed to fetch HODs:', err);
      }
    };

    fetchHods();
  }, []);

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Head of Departments</h2>

        {hods.length === 0 ? (
          <p className="text-gray-600">No HODs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow border border-gray-200">
              <thead className="bg-gray-100 text-left text-sm font-medium text-gray-700">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Specialization</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 text-gray-800">
                {hods.map((hod) => (
                  <tr key={hod._id}>
                    <td className="px-4 py-3">{hod.firstName} {hod.lastName}</td>
                    <td className="px-4 py-3">{hod.department}</td>
                    <td className="px-4 py-3">{hod.email}</td>
                    <td className="px-4 py-3">{hod.phone}</td>
                    <td className="px-4 py-3">{hod.experience} yrs</td>
                    <td className="px-4 py-3">{hod.specialization}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DepartmentList;
