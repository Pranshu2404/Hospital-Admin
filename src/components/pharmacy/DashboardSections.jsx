
// import React, { useState } from 'react';
// import { FaClipboardCheck, FaFileInvoice, FaTimes, FaUserMd, FaVial, FaPills, FaArrowLeft } from 'react-icons/fa';

// // --- Main Modal for the Prescription Flow ---
// const PrescriptionFlowModal = ({ prescriptions, onClose }) => {
//   // State to track which prescription is selected for viewing details
//   const [selectedPrescription, setSelectedPrescription] = useState(null);

//   // Function to format the timestamp for display
//   const formatTimestamp = (isoString) => {
//     return new Date(isoString).toLocaleString('en-US', {
//       dateStyle: 'medium',
//       timeStyle: 'short',
//     });
//   };

//   // If a prescription is selected, show the details view
//   if (selectedPrescription) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
//         <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
//           <div className="flex justify-between items-center p-5 border-b">
//             <div className="flex items-center gap-3">
//               <button onClick={() => setSelectedPrescription(null)} className="text-gray-500 hover:text-gray-800">
//                   <FaArrowLeft />
//               </button>
//               <h3 className="text-xl font-bold text-gray-800">Prescription Details</h3>
//             </div>
//             <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
//               <FaTimes size={20} />
//             </button>
//           </div>
//           <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//             {/* Patient & Doctor Details */}
//             <div>
//                 <h4 className="font-bold text-gray-700">Patient Information</h4>
//                 <div className="text-sm mt-2 space-y-1">
//                     <p><strong>Name:</strong> {selectedPrescription.patientName}</p>
//                     <p><strong>Prescribed by:</strong> {selectedPrescription.doctorName}</p>
//                     <p><strong>Date:</strong> {formatTimestamp(selectedPrescription.timestamp)}</p>
//                 </div>
//             </div>
//             {/* Medicines */}
//             <div>
//               <h4 className="font-bold text-gray-700 flex items-center gap-2"><FaPills /> Prescribed Medicines</h4>
//               <ul className="list-disc list-inside mt-2 text-sm space-y-1">
//                 {selectedPrescription.medicines.map((med, index) => <li key={index}>{med}</li>)}
//               </ul>
//             </div>
//             {/* Tests */}
//             <div>
//               <h4 className="font-bold text-gray-700 flex items-center gap-2"><FaVial /> Prescribed Tests</h4>
//               <ul className="list-disc list-inside mt-2 text-sm space-y-1">
//                 {selectedPrescription.tests.map((test, index) => <li key={index}>{test}</li>)}
//               </ul>
//             </div>
//           </div>
//           <div className="flex justify-end p-5 border-t gap-3">
//               <button onClick={() => setSelectedPrescription(null)} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">
//                   Back to List
//               </button>
//               <button onClick={onClose} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">
//                   Mark as Processed
//               </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Otherwise, show the list of pending prescriptions
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
//         <div className="flex justify-between items-center p-5 border-b">
//           <h3 className="text-xl font-bold text-gray-800">Pending Prescriptions</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
//             <FaTimes size={20} />
//           </button>
//         </div>
//         <div className="p-5">
//           <div className="overflow-y-auto max-h-96">
//             <table className="min-w-full text-sm">
//               <thead className="bg-gray-100 sticky top-0">
//                 <tr>
//                   <th className="px-4 py-2 text-left">Patient Name</th>
//                   <th className="px-4 py-2 text-left">Prescribed By</th>
//                   <th className="px-4 py-2 text-left">Date & Time</th>
//                   <th className="px-4 py-2 text-center">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {prescriptions.map((p) => (
//                   <tr key={p.id} className="border-b hover:bg-gray-50">
//                     <td className="px-4 py-3">{p.patientName}</td>
//                     <td className="px-4 py-3">{p.doctorName}</td>
//                     <td className="px-4 py-3">{formatTimestamp(p.timestamp)}</td>
//                     <td className="px-4 py-3 text-center">
//                       <button onClick={() => setSelectedPrescription(p)} className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-md hover:bg-blue-200">
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// // --- Quick Actions Component ---
// export const QuickActions = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Dummy data for a list of pending prescriptions
//   const pendingPrescriptions = [
//     {
//       id: 'p1',
//       patientName: 'John Doe',
//       doctorName: 'Dr. Emily Carter',
//       timestamp: '2025-08-12T13:30:00Z',
//       medicines: ['Lisinopril 10mg', 'Atorvastatin 20mg'],
//       tests: ['Complete Blood Count (CBC)'],
//     },
//     {
//       id: 'p2',
//       patientName: 'Jane Smith',
//       doctorName: 'Dr. Alan Grant',
//       timestamp: '2025-08-12T11:15:00Z',
//       medicines: ['Metformin 500mg'],
//       tests: ['Lipid Panel', 'A1C Test'],
//     },
//     {
//       id: 'p3',
//       patientName: 'Peter Jones',
//       doctorName: 'Dr. Ellie Sattler',
//       timestamp: '2025-08-12T09:05:00Z',
//       medicines: ['Amoxicillin 250mg'],
//       tests: ['Strep Test'],
//     },
//   ];

//   return (
//     <>
//       <div className="bg-white p-6 rounded-xl shadow-md">
//         <h2 className="font-bold text-lg text-gray-700 mb-4">Quick Actions</h2>
//         <div className="space-y-3">
//           <button 
//             onClick={() => setIsModalOpen(true)}
//             className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
//           >
//             <FaClipboardCheck className="text-blue-500" /> Process New Prescriptions
//           </button>
//           <button className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
//             <FaFileInvoice className="text-green-500" /> Generate Daily Report
//           </button>
//         </div>
//       </div>

//       {isModalOpen && (
//         <PrescriptionFlowModal 
//           prescriptions={pendingPrescriptions} 
//           onClose={() => setIsModalOpen(false)} 
//         />
//       )}
//     </>
//   );
// };

// // --- Other Components (Unchanged) ---
// export const LowStockList = ({ medicines }) => (
//   <div className="bg-white p-6 rounded-xl shadow-md">
//     <h2 className="font-bold text-lg text-red-600 mb-4">Low Stock Medicines</h2>
//     <div className="space-y-3">
//       {medicines.map((med) => (
//         <div key={med.id} className="flex justify-between items-center">
//           <div>
//             <div className="font-semibold text-gray-800">{med.name}</div>
//             <div className="text-sm text-gray-500">{med.supplier}</div>
//           </div>
//           <div className="font-bold text-red-700">{med.stock} left</div>
//         </div>
//       ))}
//     </div>
//   </div>
// );

// export const RecentSalesTable = ({ sales }) => (
//   <div className="bg-white p-6 rounded-xl shadow-md">
//     <h2 className="font-bold text-lg text-gray-700 mb-4">Recent Sales</h2>
//     <div className="overflow-x-auto">
//       <table className="w-full text-sm text-left">
//         <thead className="text-xs text-gray-700 uppercase bg-gray-100">
//           <tr>
//             <th scope="col" className="px-6 py-3">Sale ID</th>
//             <th scope="col" className="px-6 py-3">Medicine</th>
//             <th scope="col" className="px-6 py-3">Amount</th>
//             <th scope="col" className="px-6 py-3">Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {sales.map((sale) => (
//             <tr key={sale.id} className="bg-white border-b hover:bg-gray-50">
//               <td className="px-6 py-4 font-medium text-gray-900">{sale.id}</td>
//               <td className="px-6 py-4">{sale.name}</td>
//               <td className="px-6 py-4">{sale.amount}</td>
//               <td className="px-6 py-4">
//                 <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                   sale.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//                 }`}>{sale.status}</span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );



import React, { useState, useEffect } from 'react';
import { FaClipboardCheck, FaFileInvoice, FaTimes, FaUserMd, FaVial, FaPills, FaArrowLeft } from 'react-icons/fa';

// --- Modal for the Prescription Flow ---
const PrescriptionFlowModal = ({ prescriptions, onClose }) => {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailedItems, setDetailedItems] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Function to fetch detailed items for a selected prescription
  const handleViewDetails = async (prescription) => {
    setSelectedPrescription(prescription);
    setIsLoadingDetails(true);
    try {
      const response = await fetch(`http://localhost:5000/api/prescriptions/${prescription._id}`);
      if (!response.ok) throw new Error('Failed to fetch prescription details.');
      const data = await response.json();
      setDetailedItems(data.items || []);
    } catch (error) {
      console.error(error);
      setDetailedItems([]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Details View
  if (selectedPrescription) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
          <div className="flex justify-between items-center p-5 border-b">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedPrescription(null)} className="text-gray-500 hover:text-gray-800">
                  <FaArrowLeft />
              </button>
              <h3 className="text-xl font-bold text-gray-800">Prescription Details</h3>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <FaTimes size={20} />
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
                <h4 className="font-bold text-gray-700">Patient Information</h4>
                <div className="text-sm mt-2 space-y-1">
                    <p><strong>Name:</strong> {`${selectedPrescription.patient_id?.first_name || ''} ${selectedPrescription.patient_id?.last_name || ''}`.trim()}</p>
                    {/* Correctly access doctor's first and last name */}
                    <p><strong>Prescribed by:</strong> {`${selectedPrescription.doctor_id?.first_name || ''} ${selectedPrescription.doctor_id?.last_name || 'N/A'}`.trim()}</p>
                    {/* Use created_at for the date */}
                    <p><strong>Date:</strong> {formatTimestamp(selectedPrescription.created_at)}</p>
                </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-700">Diagnosis</h4>
              <p className="text-sm mt-1">{selectedPrescription.diagnosis || 'No diagnosis provided.'}</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 flex items-center gap-2"><FaPills /> Prescribed Medicines</h4>
              {isLoadingDetails ? <p className="text-sm text-gray-500">Loading medicines...</p> : (
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  {detailedItems.length > 0 ? detailedItems.map((item, index) => 
                    <li key={index}>{`${item.medicine_name} (${item.dosage}) - ${item.duration}`}</li>
                  ) : <li>No medicines listed.</li>}
                </ul>
              )}
            </div>
          </div>
          <div className="flex justify-end p-5 border-t gap-3">
              <button onClick={() => setSelectedPrescription(null)} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">
                  Back to List
              </button>
              <button onClick={onClose} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">
                  Mark as Processed
              </button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">Pending Prescriptions</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-5">
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Patient Name</th>
                  <th className="px-4 py-2 text-left">Prescribed By</th>
                  <th className="px-4 py-2 text-left">Date & Time</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{`${p.patient_id?.first_name || ''} ${p.patient_id?.last_name || 'Unknown'}`.trim()}</td>
                    {/* Correctly access doctor's first and last name */}
                    <td className="px-4 py-3">{`${p.doctor_id?.first_name || ''} ${p.doctor_id?.last_name || 'Unknown Doctor'}`.trim()}</td>
                    {/* Use created_at for the date */}
                    <td className="px-4 py-3">{formatTimestamp(p.created_at)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleViewDetails(p)} className="bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-md hover:bg-blue-200">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Quick Actions Component ---
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
      const response = await fetch('http://localhost:5000/api/prescriptions');
      if (!response.ok) {
        throw new Error('Failed to fetch prescriptions');
      }
      const data = await response.json();
      setPrescriptions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="font-bold text-lg text-gray-700 mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <button 
            onClick={handleOpenModal}
            className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <FaClipboardCheck className="text-blue-500" /> Process New Prescriptions
          </button>
          <button className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <FaFileInvoice className="text-green-500" /> Generate Daily Report
          </button>
        </div>
      </div>

      {isModalOpen && (
        loading ? <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><p className="text-white p-4 bg-gray-800 rounded-lg">Loading Prescriptions...</p></div> : 
        error ? <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><p className="text-white p-4 bg-red-800 rounded-lg">Error: {error}</p></div> :
        <PrescriptionFlowModal 
          prescriptions={prescriptions} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};


// --- Other Components (Unchanged) ---
export const LowStockList = ({ medicines }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h2 className="font-bold text-lg text-red-600 mb-4">Low Stock Medicines</h2>
    <div className="space-y-3">
      {medicines.map((med) => (
        <div key={med.id} className="flex justify-between items-center">
          <div>
            <div className="font-semibold text-gray-800">{med.name}</div>
            <div className="text-sm text-gray-500">{med.supplier}</div>
          </div>
          <div className="font-bold text-red-700">{med.stock} left</div>
        </div>
      ))}
    </div>
  </div>
);

export const RecentSalesTable = ({ sales }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h2 className="font-bold text-lg text-gray-700 mb-4">Recent Sales</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th scope="col" className="px-6 py-3">Sale ID</th>
            <th scope="col" className="px-6 py-3">Medicine</th>
            <th scope="col" className="px-6 py-3">Amount</th>
            <th scope="col" className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{sale.id}</td>
              <td className="px-6 py-4">{sale.name}</td>
              <td className="px-6 py-4">{sale.amount}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  sale.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>{sale.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
