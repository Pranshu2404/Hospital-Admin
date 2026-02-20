// pages/dashboard/pathology/requests.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { pathologySidebar } from '../../../constants/sidebarItems/pathologySidebar';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaCheckCircle, 
  FaClock,
  FaExclamationTriangle,
  FaFlask,
  FaUserMd,
  FaCalendarAlt,
  FaMicroscope,
  FaFileMedical
} from 'react-icons/fa';

const TestRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);

  const statusOptions = ['all', 'pending', 'approved', 'sample_collected', 'processing', 'completed', 'cancelled'];
  const categories = ['Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Pathology'];

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter, categoryFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      // const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/lab-requests`);
      // setRequests(response.data.data);
      
      // Mock data for demonstration
      const mockRequests = [
        {
          _id: '1',
          request_id: 'REQ001',
          patient_name: 'John Doe',
          patient_age: 45,
          patient_gender: 'Male',
          test_name: 'Complete Blood Count',
          test_code: 'CBC',
          category: 'Hematology',
          doctor_name: 'Dr. Smith',
          status: 'pending',
          priority: 'urgent',
          requested_date: '2024-01-15',
          notes: 'Fasting required',
          specimen_type: 'Whole blood'
        },
        {
          _id: '2',
          request_id: 'REQ002',
          patient_name: 'Jane Smith',
          patient_age: 32,
          patient_gender: 'Female',
          test_name: 'Lipid Profile',
          test_code: 'LIPID',
          category: 'Biochemistry',
          doctor_name: 'Dr. Johnson',
          status: 'approved',
          priority: 'normal',
          requested_date: '2024-01-15',
          notes: '12 hour fasting',
          specimen_type: 'Serum'
        },
        {
          _id: '3',
          request_id: 'REQ003',
          patient_name: 'Mike Wilson',
          patient_age: 58,
          patient_gender: 'Male',
          test_name: 'Thyroid Profile',
          test_code: 'TFT',
          category: 'Endocrinology',
          doctor_name: 'Dr. Brown',
          status: 'sample_collected',
          priority: 'normal',
          requested_date: '2024-01-14',
          specimen_type: 'Serum'
        }
      ];
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.patient_name?.toLowerCase().includes(term) ||
        r.test_name?.toLowerCase().includes(term) ||
        r.test_code?.toLowerCase().includes(term) ||
        r.request_id?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      // await axios.put(`${import.meta.env.VITE_BACKEND_URL}/lab-requests/${id}`, { status: newStatus });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCollectSample = async () => {
    if (!selectedRequest) return;
    await handleStatusChange(selectedRequest._id, 'sample_collected');
    setShowCollectModal(false);
    setSelectedRequest(null);
  };

  const getStatusBadge = (status) => {
    const config = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaClock },
      'approved': { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaCheckCircle },
      'sample_collected': { bg: 'bg-purple-100', text: 'text-purple-800', icon: FaFlask },
      'processing': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: FaMicroscope },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: FaExclamationTriangle }
    };
    const { bg, text, icon: Icon } = config[status] || config.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="mr-1" size={10} />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'urgent': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'normal': 'bg-blue-100 text-blue-800',
      'low': 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || colors.normal}`}>
        {priority}
      </span>
    );
  };

  return (
    <Layout sidebarItems={pathologySidebar} section="Pathology">
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Test Requests</h1>
          <p className="text-gray-500 mt-1">Manage and process laboratory test requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, test..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              {statusOptions.filter(s => s !== 'all').map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="text-sm text-gray-500 flex items-center">
              Showing {filteredRequests.length} of {requests.length} requests
            </div>
          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaFileMedical className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Test Requests Found</h3>
            <p className="text-gray-500">No requests match your search criteria</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-teal-600 bg-teal-50 px-2 py-1 rounded">
                          {request.request_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{request.patient_name}</div>
                        <div className="text-xs text-gray-500">{request.patient_age} yrs, {request.patient_gender}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{request.test_name}</div>
                        <div className="text-xs text-gray-500">{request.test_code} • {request.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{request.doctor_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(request.priority)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(request.requested_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
                            title="View Details"
                          >
                            <FaEye size={16} />
                          </button>
                          {request.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowCollectModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Collect Sample"
                            >
                              <FaFlask size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Test Request Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Request ID</p>
                    <p className="font-medium">{selectedRequest.request_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium">{new Date(selectedRequest.requested_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-3">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium">{selectedRequest.patient_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Age/Gender</p>
                      <p className="font-medium">{selectedRequest.patient_age} yrs, {selectedRequest.patient_gender}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-3">Test Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Test Name</p>
                      <p className="font-medium">{selectedRequest.test_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Code</p>
                      <p className="font-medium">{selectedRequest.test_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="font-medium">{selectedRequest.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Specimen Type</p>
                      <p className="font-medium">{selectedRequest.specimen_type}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-3">Doctor Information</h3>
                  <div>
                    <p className="text-xs text-gray-500">Requesting Doctor</p>
                    <p className="font-medium">{selectedRequest.doctor_name}</p>
                  </div>
                </div>

                {selectedRequest.notes && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold mb-3">Notes</h3>
                    <p className="text-sm text-gray-700">{selectedRequest.notes}</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Collect Sample Modal */}
        {showCollectModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaFlask className="text-blue-600 text-xl" />
                </div>
                <h3 className="text-lg font-bold">Collect Sample</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Mark sample as collected for {selectedRequest.patient_name}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm"><span className="font-medium">Test:</span> {selectedRequest.test_name}</p>
                <p className="text-sm"><span className="font-medium">Specimen:</span> {selectedRequest.specimen_type}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCollectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCollectSample}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Collection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestRequests;