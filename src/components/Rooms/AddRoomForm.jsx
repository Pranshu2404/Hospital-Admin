import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '../common/FormElements';
import { PlusIcon } from '../common/Icons';

const AddRoom = () => {
  const [formData, setFormData] = useState({
    room_number: '',
    ward: '',
    type: 'General',
    Department: '',
    status: 'Available',
    assigned_patient_id: undefined
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/departments`);
      setDepartments(response.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const submitData = {
    room_number: formData.room_number,
    ward: formData.ward || undefined,
    type: formData.type,
    Department: formData.Department || undefined,
    status: formData.status,
    // Convert empty string to null/undefined
    assigned_patient_id: formData.assigned_patient_id || undefined
  };

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/rooms`,
      submitData
    );

      console.log('Room added:', response.data);
      
      toast.success('Room added successfully!');
      setFormData({
        room_number: '',
        ward: '',
        type: 'General',
        Department: '',
        status: 'Available',
        assigned_patient_id: undefined
      });
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error(error.response?.data?.error || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Room</h2>
            <p className="text-gray-600 mt-1">Create a new room entry in the system</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Number *
            </label>
            <input
              type="text"
              name="room_number"
              value={formData.room_number}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter room number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ward
            </label>
            <input
              type="text"
              name="ward"
              value={formData.ward}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter ward name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="General">General</option>
              <option value="ICU">ICU</option>
              <option value="Private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              name="Department"
              value={formData.Department}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Patient ID
            </label>
            <input
              type="text"
              name="assigned_patient_id"
              value={formData.assigned_patient_id}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter patient ID (if occupied)"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setFormData({
              room_number: '',
              ward: '',
              type: 'General',
              Department: '',
              status: 'Available',
              assigned_patient_id: ''
            })}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {loading ? 'Adding Room...' : 'Add Room'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;