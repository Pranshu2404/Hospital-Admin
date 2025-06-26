import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import axios from 'axios';

const SelectDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
        setDepartments(res.data); // Should be [{ _id, name }]
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  const handleAddDepartment = (e) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) return;

    const alreadyExists = departments.some(
      (dept) => dept.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      alert('Department already exists');
      return;
    }

    navigate(`/dashboard/admin/add-hod?name=${encodeURIComponent(trimmed)}`);
  };

  const handleDepartmentClick = (deptId) => {
    navigate(`/dashboard/admin/add-hod?id=${deptId}`);
  };

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6">
        {/* Add Department Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Department</h2>
          <form onSubmit={handleAddDepartment} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter department name"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700"
            >
              Add Department
            </button>
          </form>
        </div>

        {/* Department Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Department</h2>
          <p className="text-gray-600 mb-6">Click a department to Edit its Head Doctor</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <button
                key={dept._id}
                onClick={() => handleDepartmentClick(dept._id)}
                className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-left hover:bg-blue-100 transition"
              >
                <h3 className="text-lg font-medium text-blue-900">{dept.name}</h3>
                <p className="text-sm text-blue-600">Click to Edit Head of Department</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SelectDepartment;
