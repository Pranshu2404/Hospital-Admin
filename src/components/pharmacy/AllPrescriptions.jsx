import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaFilePrescription, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit,
  FaTrash,
  FaPlus,
  FaUser,
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaPills
} from 'react-icons/fa';

const AllPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPrescriptions();
  }, [page, statusFilter]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const params = { 
        page, 
        limit: 10,
        status: statusFilter
      };
      
      const response = await apiClient.get('/prescriptions', { params });
      setPrescriptions(response.data.prescriptions);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePrescription = async (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        await apiClient.delete(`/prescriptions/${id}`);
        fetchPrescriptions(); // Refresh the list
      } catch (err) {
        console.error('Error deleting prescription:', err);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      Active: 'bg-green-100 text-green-800',
      Completed: 'bg-blue-100 text-blue-800',
      Expired: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statuses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patient_id?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patient_id?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patient_id?.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctor_id?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctor_id?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFilePrescription className="text-teal-600" />
            All Prescriptions
          </h1>
          <p className="text-gray-600">Manage all patient prescriptions</p>
        </div>
        <Link
          to="/dashboard/pharmacy/prescriptions/new"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <FaPlus /> New Prescription
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredPrescriptions.length} prescriptions
          </div>
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prescription ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPrescriptions.map((prescription) => (
                <tr key={prescription._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-teal-600">#{prescription._id.slice(-6)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {prescription.patient_id?.first_name} {prescription.patient_id?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {prescription.patient_id?.patientId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaUserMd className="text-gray-400" />
                      <div>
                        <div className="font-medium">
                          Dr. {prescription.doctor_id?.firstName} {prescription.doctor_id?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {prescription.doctor_id?.specialization}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {new Date(prescription.issue_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {prescription.items?.length || 0} medications
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(prescription.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/dashboard/pharmacy/prescriptions/${prescription._id}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        to={`/dashboard/pharmacy/prescriptions/edit/${prescription._id}`}
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => deletePrescription(prescription._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPrescriptions.length === 0 && (
          <div className="text-center py-12">
            <FaFilePrescription className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No prescriptions found</p>
            <Link
              to="/dashboard/pharmacy/prescriptions/new"
              className="text-teal-600 hover:text-teal-700 text-sm"
            >
              Create your first prescription
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllPrescriptions;