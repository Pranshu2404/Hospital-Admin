import React, { useState } from 'react';
import { FaClipboardCheck, FaFileInvoice } from 'react-icons/fa';
import apiClient from '../../api/apiClient'; // Adjust path as needed
import PrescriptionFlowModal from './PrescriptionFlowModal'; // Import the new modal component

export const QuickActions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/prescriptions');
      setPrescriptions(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="font-bold text-lg text-gray-700 mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <button 
            onClick={handleOpenModal}
            className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            <FaClipboardCheck className="text-blue-500" /> Process New Prescriptions
          </button>
          {/* <button className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100">
            <FaFileInvoice className="text-green-500" /> Generate Daily Report
          </button> */}
        </div>
      </div>

      {isModalOpen && (
        loading ? <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><p className="text-white p-4 bg-gray-800 rounded-lg">Loading...</p></div> : 
        error ? <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><p className="text-white p-4 bg-red-800 rounded-lg">Error: {error}</p></div> :
        <PrescriptionFlowModal 
          prescriptions={prescriptions} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
};