import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/doctors/${id}`);
        setDoctor(res.data);
      } catch (err) {
        console.error('Error fetching doctor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <Layout sidebarItems={adminSidebar}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout sidebarItems={adminSidebar}>
        <div className="p-6 text-red-600">Doctor not found.</div>
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Dr. {doctor.firstName} {doctor.lastName}
            </h2>
            <button
              className="px-4 py-2 bg-gray-100 text-sm text-gray-700 rounded hover:bg-gray-200"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Basic Info</h3>
              <p><strong>Email:</strong> {doctor.email}</p>
              <p><strong>Phone:</strong> {doctor.phone}</p>
              <p><strong>Gender:</strong> {doctor.gender}</p>
              <p><strong>Date of Birth:</strong> {doctor.dateOfBirth}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Professional Info</h3>
              <p><strong>Department:</strong> {doctor.department?.name}</p>
              <p><strong>Specialization:</strong> {doctor.specialization}</p>
              <p><strong>Experience:</strong> {doctor.experience} years</p>
              <p><strong>License No:</strong> {doctor.licenseNumber}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Employment Info</h3>
              <p><strong>Start Date:</strong> {doctor.startDate}</p>
              <p><strong>Shift:</strong> {doctor.shift}</p>
              <p><strong>Status:</strong> {doctor.status || 'Active'}</p>
              <p><strong>Full Time:</strong> {doctor.isFullTime ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Other Info</h3>
              <p><strong>Emergency Contact:</strong> {doctor.emergencyContact}</p>
              <p><strong>Emergency Phone:</strong> {doctor.emergencyPhone}</p>
              <p><strong>Insurance:</strong> {doctor.hasInsurance ? 'Yes' : 'No'}</p>
              <p><strong>Notes:</strong> {doctor.notes || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfilePage;
