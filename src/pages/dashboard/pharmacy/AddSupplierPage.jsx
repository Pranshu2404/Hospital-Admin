import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../api/apiClient'; // Adjust path as needed
import Layout from '../../../components/Layout'; // Import Layout
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar'; // Import sidebar config

const AddSupplierPage = () => {
  const navigate = useNavigate();
  const initialFormState = {
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification({ message: '', type: '' });

    try {
      await apiClient.post('/api/suppliers', formData);
      
      showNotification('Supplier added successfully! Redirecting to list...', 'success');
      setFormData(initialFormState); // Clear the form

      // Redirect to the suppliers list page after a short delay
      setTimeout(() => {
        navigate('/dashboard/pharmacy/suppliers');
      }, 2000);

    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add supplier. Please try again.';
      showNotification(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout sidebarItems={pharmacySidebar} section="Pharmacy">

        <div className="p-6 bg-gray-50 min-h-screen">
        {/* Notification Area */}
        {notification.message && (
            <div className={`p-4 mb-6 rounded-md text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {notification.message}
            </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md">
            <div>
            <h1 className="text-3xl font-bold text-gray-800">Add New Supplier</h1>
            <p className="text-gray-500 mt-1">Fill in the details to add a new supplier to the system.</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Supplier Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Pharma Inc."
                />
                </div>
                <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person</label>
                <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., John Doe"
                />
                </div>
                <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., +1234567890"
                />
                </div>
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., contact@pharma.com"
                />
                </div>
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                id="address"
                name="address"
                rows="4"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 123 Health St, Medcity"
                ></textarea>
            </div>
            <div className="flex justify-end gap-4">
                <button
                type="button"
                onClick={() => navigate('/dashboard/pharmacy/suppliers')}
                className="bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                Cancel
                </button>
                <button
                type="submit"
                disabled={submitting}
                className="bg-teal-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {submitting ? 'Adding...' : 'Add Supplier'}
                </button>
            </div>
            </form>
        </div>
        </div>
    </Layout>
  );
};

export default AddSupplierPage;