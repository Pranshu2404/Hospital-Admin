import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { 
  FaClipboardList, 
  FaSearch, 
  FaFilter,
  FaClock,
  FaUser,
  FaUserMd,
  FaCalendarAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

const PrescriptionQueue = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    fetchQueuePrescriptions();
  }, [priorityFilter]);

  const fetchQueuePrescriptions = async () => {
    try {
      setLoading(true);
      const params = { status: 'Active' };
      if (priorityFilter) params.priority = priorityFilter;
      
      const response = await apiClient.get('/prescriptions', { params });
      // Filter prescriptions that have undispensed items
      const queuePrescriptions = response.data.prescriptions.filter(prescription =>
        prescription.items.some(item => !item.is_dispensed)
      );
      setPrescriptions(queuePrescriptions);
    } catch (err) {
      console.error('Error fetching queue prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = (prescription) => {
    // Store the selected prescription in sessionStorage
    sessionStorage.setItem('selectedPrescription', JSON.stringify({
      _id: prescription._id,
      patient_id: prescription.patient_id,
      prescription_number: prescription.prescription_number
    }));
    
    // Navigate to dispense page
    window.location.href = '/dashboard/pharmacy/prescriptions/dispense';
  };

  const getPriorityBadge = (priority) => {
    const priorities = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorities[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority || 'Normal'}
      </span>
    );
  };

  const getUrgencyStatus = (issueDate) => {
    const issued = new Date(issueDate);
    const now = new Date();
    const diffTime = Math.abs(now - issued);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 5) return 'text-red-600';
    if (diffDays > 3) return 'text-orange-600';
    return 'text-green-600';
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
            <FaClipboardList className="text-teal-600" />
            Prescription Queue
          </h1>
          <p className="text-gray-600">Manage pending prescription medications</p>
        </div>
        <div className="text-sm text-gray-600">
          {filteredPrescriptions.length} prescriptions in queue
        </div>
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
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <button
            onClick={fetchQueuePrescriptions}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Prescriptions Queue */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPrescriptions.map((prescription) => {
          const pendingItems = prescription.items.filter(item => !item.is_dispensed).length;
          const totalItems = prescription.items.length;
          
          return (
            <div key={prescription._id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-teal-600">
                      #{prescription._id.slice(-6)}
                    </span>
                    {getPriorityBadge(prescription.priority)}
                    <span className={`flex items-center gap-1 text-sm ${getUrgencyStatus(prescription.issue_date)}`}>
                      <FaClock /> {new Date(prescription.issue_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      <span className="font-medium">
                        {prescription.patient_id?.first_name} {prescription.patient_id?.last_name}
                      </span>
                      <span className="text-sm text-gray-500">(ID: {prescription.patient_id?.patientId})</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaUserMd className="text-gray-400" />
                      <span className="text-sm">
                        Dr. {prescription.doctor_id?.firstName} {prescription.doctor_id?.lastName}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${pendingItems > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {pendingItems} of {totalItems} items pending
                  </div>
                  <div className="text-xs text-gray-500">
                    {prescription.appointment_id?.type} appointment
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Diagnosis</h4>
                  <p className="text-sm text-gray-600">{prescription.diagnosis || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Pending Medications</h4>
                  <div className="space-y-1">
                    {prescription.items
                      .filter(item => !item.is_dispensed)
                      .map((item, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{item.medicine_name}</span>
                          <span className="text-gray-500 ml-2">
                            ({item.dosage}, {item.frequency}, {item.duration})
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <div className="text-sm text-gray-500">
                  {prescription.follow_up_date && (
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> Follow-up: {new Date(prescription.follow_up_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDispense(prescription)}
                    className="px-3 py-1 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700"
                  >
                    Dispense
                  </button>
                  <button
                    onClick={() => window.location.href = `/dashboard/pharmacy/prescriptions/${prescription._id}`}
                    className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPrescriptions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No prescriptions in queue</p>
          <p className="text-sm text-gray-400 mt-1">All prescriptions have been processed</p>
        </div>
      )}

      {/* Urgent Notice */}
      {filteredPrescriptions.some(p => 
        new Date(p.issue_date) < new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      ) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <FaExclamationTriangle />
            <span className="font-medium">Notice:</span>
            <span>Some prescriptions are older than 5 days. Please prioritize these.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionQueue;