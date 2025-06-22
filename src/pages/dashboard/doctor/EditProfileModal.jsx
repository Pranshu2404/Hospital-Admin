
import React, { useState } from 'react';

const EditProfileModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: 'Dr. Emily Stone',
    specialization: 'Cardiologist',
    email: 'emily.stone@clinic.com',
    phone: '(+1) 234‑567‑8901',
    location: '123 Medical Ave, Health City',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Name"
          />
          <input
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Specialization"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Email"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Phone"
          />
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Location"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;