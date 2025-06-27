import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    hospitalID: '',
    fireNOC: '',
    registryNo: '',
    address: '',
    contact: '',
    policyDetails: '',
    healthBima: '',
    additionalInfo: '',
    companyName: '', // Added
    companyNumber: '', // Added
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, form);
      console.log('✅ Registration success:', response.data);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      console.error('🔴 Registration error response:', err);
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen md:p-10 bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">Hospital Registration</h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        <div className="grid grid-cols-1 gap-8">
          {/* Section 1: Hospital Details */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-teal-700">Hospital Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Hospital Name" value={form.name} onChange={handleChange} required className="p-2 border rounded" />
              <input type="text" name="companyName" placeholder="Company Name" value={form.companyName} onChange={handleChange} className="p-2 border rounded" />
              <input type="text" name="companyNumber" placeholder="Company Number/license" value={form.companyNumber} onChange={handleChange} className="p-2 border rounded" />
              <input
                type="text"
                name="hospitalID"
                placeholder="Hospital/Clinic ID (e.g. AB1234)"
                value={form.hospitalID}
                onChange={handleChange}
                required
                pattern="^[A-Za-z]{2}\d{4}$"
                title="Hospital ID must be 2 letters followed by 4 numbers (e.g. AB1234)"
                className="p-2 border rounded"
              />

              <input type="text" name="fireNOC" placeholder="Fire NOC" value={form.fireNOC} onChange={handleChange} required className="p-2 border rounded" />
              <input type="text" name="registryNo" placeholder="Registry Number" value={form.registryNo} onChange={handleChange} required className="p-2 border rounded" />
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-teal-700">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="p-2 border rounded" />
              <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required className="p-2 border rounded" />

              <input type="tel" name="contact" placeholder="Contact Number" value={form.contact} onChange={handleChange} required className="p-2 border rounded" />
              <select name="role" value={form.role} onChange={handleChange} className="p-2 border rounded">
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff</option>
                <option value="pharmacy">Pharmacy</option>
              </select>
              <input
                type="text"
                name="address"
                placeholder="Enter Full Address"
                value={form.address}
                onChange={handleChange}
                required
                className="p-2 border rounded col-span-1 md:col-span-2"
              />
            </div>
          </div>

          {/* Section 3: Other Details */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-teal-700">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea name="policyDetails" placeholder="Policy Details" value={form.policyDetails} onChange={handleChange} rows={3} className="col-span-1 md:col-span-2 p-2 border rounded" />
              <textarea name="healthBima" placeholder="Health Insurance (Bima) Details" value={form.healthBima} onChange={handleChange} rows={3} className="col-span-1 md:col-span-2 p-2 border rounded" />
              <textarea name="additionalInfo" placeholder="Additional Information" value={form.additionalInfo} onChange={handleChange} rows={3} className="col-span-1 md:col-span-2 p-2 border rounded" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full mt-6 bg-teal-600 text-white py-2 rounded hover:bg-teal-700">
          Register Hospital
        </button>
      </form>
    </div>
  );
}
