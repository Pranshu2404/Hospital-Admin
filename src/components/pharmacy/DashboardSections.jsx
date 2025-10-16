import React, { useState, useEffect } from 'react';
import {
  FaClipboardCheck,
  FaFileInvoice,
  FaTimes,
  FaSearch,
  FaArrowRight,
  FaPills, // Added icon
} from 'react-icons/fa';
import apiClient from '../../api/apiClient';

// --- A modern, professional modal for managing prescriptions ---
const PrescriptionsManagerModal = ({ initialPrescriptions, isLoading, error, onClose }) => {
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const renderPatientName = (p) => {
    if (!p) return 'Unknown Patient';
    const raw = p.patient || p.patient_id;
    if (!raw) return 'Unknown Patient';
    return `${raw.first_name || ''} ${raw.last_name || ''}`.trim() || 'Unknown Patient';
  };

  const filteredPrescriptions = initialPrescriptions.filter(p =>
    renderPatientName(p).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <FaClipboardCheck className="text-2xl text-teal-600" />
            <h3 className="text-xl font-bold text-gray-800">Process Prescriptions</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-200 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column: Prescription List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <p className="p-4 text-gray-500">Loading prescriptions...</p>
              ) : error ? (
                <p className="p-4 text-red-600">Error: {error}</p>
              ) : filteredPrescriptions.length === 0 ? (
                <p className="p-4 text-gray-500">No prescriptions found.</p>
              ) : (
                <ul>
                  {filteredPrescriptions.map(pres => (
                    <li key={pres._id}>
                      <button
                        onClick={() => setSelected(pres)}
                        className={`w-full text-left p-4 border-b border-gray-100 hover:bg-teal-50 transition-colors ${
                          selected?._id === pres._id ? 'bg-teal-100 border-l-4 border-teal-500' : ''
                        }`}
                      >
                        <div className="font-bold text-gray-800">{renderPatientName(pres)}</div>
                        <p className="text-sm text-gray-500">
                          {new Date(pres.created_at || pres.createdAt || Date.now()).toLocaleString()}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right Column: Details View */}
          <div className="w-2/3 flex-1 flex flex-col overflow-y-auto p-6 bg-slate-50">
            {!selected ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500">
                <FaArrowRight className="text-4xl mb-4" />
                <h3 className="text-xl font-semibold">Select a Prescription</h3>
                <p>Choose a prescription from the list on the left to view details.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <h4 className="text-2xl font-bold text-gray-800">
                  Prescription Details
                </h4>

                {/* Patient Info & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-sm border">
                  <div>
                      <dt className="text-sm font-medium text-gray-500">Patient</dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">{renderPatientName(selected)}</dd>
                  </div>
                   <div>
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-base text-gray-700 whitespace-pre-wrap">
                        {selected.notes || 'No notes available.'}
                      </dd>
                    </div>
                </div>

                {/* --- THIS ENTIRE SECTION WAS MISSING --- */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className='flex items-center gap-3 mb-4'>
                    <FaPills className="text-teal-600 text-xl" />
                    <h5 className="font-bold text-lg text-gray-700">Prescribed Medicines</h5>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                        <tr>
                          <th scope="col" className="px-6 py-3 rounded-l-lg">Medicine</th>
                          <th scope="col" className="px-6 py-3">Dosage</th>
                          <th scope="col" className="px-6 py-3">Frequency</th>
                          <th scope="col" className="px-6 py-3 rounded-r-lg">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.medicines && selected.medicines.length > 0 ? (
                          selected.medicines.map((med, index) => (
                            <tr key={index} className="bg-white border-b">
                              {/* --- IMPORTANT FIX: Access the nested medicine name --- */}
                              <td className="px-6 py-4 font-medium text-gray-900">
                                {med.medicine_id ? med.medicine_id.name : 'Invalid Medicine'}
                              </td>
                              <td className="px-6 py-4">{med.dosage}</td>
                              <td className="px-6 py-4">{med.frequency}</td>
                              <td className="px-6 py-4">{med.duration}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-500">
                              No medicine data available for this prescription.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Image Preview */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <dt className="text-sm font-medium text-gray-500 mb-2">Image</dt>
                  {selected.prescription_image ? (
                    <div className="border rounded-lg p-2 bg-white max-h-[40vh] overflow-auto">
                      <img
                        src={selected.prescription_image}
                        alt="Prescription"
                        className="w-full h-auto object-contain cursor-pointer"
                        onClick={() => window.open(selected.prescription_image, '_blank')}
                      />
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg text-sm text-gray-500">No image available.</div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button className="px-5 py-2.5 rounded-lg bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-colors">
                    Mark as Reviewed
                  </button>
                  <button className="px-5 py-2.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2">
                    <FaFileInvoice /> Create Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// --- The QuickActions component (No changes needed here) ---
export const QuickActions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionCount, setPrescriptionCount] = useState(0); // For the badge
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch count initially for the badge
  useEffect(() => {
    apiClient.get('/prescriptions') // Assuming an endpoint like this exists
      .then(response => {
        setPrescriptionCount(response.data.prescriptions.length() || 0);
      })
      .catch(() => {
        // Silently fail or handle error for count
      });
  }, []);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/prescriptions');
      setPrescriptions(response.data.prescriptions);
    } catch (err) {
      setError(err.message || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="font-bold text-lg text-gray-700 mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <button
            onClick={handleOpenModal}
            className="w-full flex items-center justify-between text-left p-3 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <FaClipboardCheck className="text-teal-500 text-xl group-hover:text-teal-600" />
              <span className="font-semibold text-gray-700">Process New Prescriptions</span>
            </div>
            {prescriptionCount > 0 && (
              <span className="bg-teal-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {prescriptionCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <PrescriptionsManagerModal
          initialPrescriptions={prescriptions}
          isLoading={loading}
          error={error}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};





































