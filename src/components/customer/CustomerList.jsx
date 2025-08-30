// import React, { useState } from 'react';
// import { Button, SearchInput } from '../common/FormElements';
// import { FaTimes } from 'react-icons/fa';

// // --- Modal Component for Customer Profile ---
// const CustomerProfileModal = ({ customer, onClose }) => {
//   if (!customer) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
//         <div className="flex justify-between items-center p-5 border-b">
//           <h3 className="text-xl font-bold text-gray-800">{customer.name}</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
//             <FaTimes size={20} />
//           </button>
//         </div>
//         <div className="p-6 space-y-3 text-sm">
//           <p><strong>Customer ID:</strong> {customer.id}</p>
//           <p><strong>Email:</strong> {customer.email}</p>
//           <p><strong>Phone:</strong> {customer.phone}</p>
//           <p><strong>Address:</strong> {customer.address}</p>
//           <hr className="my-3"/>
//           <p><strong>Last Purchase:</strong> {customer.purchase}</p>
//           <p><strong>Amount:</strong> {customer.amount}</p>
//           <div>
//             <strong>Status:</strong>
//             <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
//               {customer.status}
//             </span>
//           </div>
//         </div>
//         <div className="flex justify-end p-4 border-t">
//           <Button onClick={onClose} variant="secondary">
//             Close
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };


// // --- Main Customer List Component ---
// const CustomerList = ({ setCurrentPage }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCustomer, setSelectedCustomer] = useState(null);

//   const customers = [
//     { id: 'P6985', name: 'Abu Bin Ishtiyak', email: 'info@softnio.com', phone: '+811 847-4958', address: 'Large cottage', purchase: 'Omiodon10mg, 10pcs', amount: '78.55 USD', status: 'Inactive' },
//     { id: 'P6986', name: 'Ashley Lawson', email: 'ashley@softnio.com', phone: '+124 394-1787', address: 'Near Roberts Lake', purchase: 'Zimax50mg, 12pcs', amount: '90.20 USD', status: 'Active' },
//     { id: 'P6987', name: 'Joe Larson', email: 'larson@example.com', phone: '+168 603-2320', address: 'Uttara,sector 10', purchase: 'Furosemide, 1 bottle', amount: '43.98 USD', status: 'Active' },
//     { id: 'P6988', name: 'Jane Montgomery', email: 'jane84@example.com', phone: '+439 271-5360', address: 'Dhanmondi 9/A', purchase: 'Isoniazid Syrup, 2 bottles', amount: '80.26 USD', status: 'Active' }
//   ];

//   const filtered = customers.filter(c =>
//     c.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <>
//       <div className="p-6">
//         <div className="bg-white shadow rounded-xl p-6">
//           <div className="flex justify-between items-center mb-4">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-800">Customer List</h2>
//               <p className="text-gray-500">You have total {customers.length} Customers.</p>
//             </div>
//             <Button onClick={() => setCurrentPage('AddCustomerForm')}>
//               + Add Customer
//             </Button>
//           </div>

//           <SearchInput
//             placeholder="Search by name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />

//           <div className="overflow-x-auto mt-4">
//             <table className="w-full text-sm text-gray-700">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="p-3 text-left">Customer</th>
//                   <th className="p-3 text-left">ID</th>
//                   <th className="p-3 text-left">Phone</th>
//                   <th className="p-3 text-left">Purchase Details</th>
//                   <th className="p-3 text-left">Status</th>
//                   <th className="p-3 text-center">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map(c => (
//                   <tr key={c.id} className="border-b">
//                     <td className="p-3">
//                       {c.name}
//                       <br />
//                       <span className="text-xs text-gray-500">{c.email}</span>
//                     </td>
//                     <td className="p-3">{c.id}</td>
//                     <td className="p-3">{c.phone}</td>
//                     <td className="p-3">{c.purchase}</td>
//                     <td className="p-3">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
//                         {c.status}
//                       </span>
//                     </td>
//                     <td className="p-3 text-center">
//                       <button
//                         onClick={() => setSelectedCustomer(c)}
//                         className="text-blue-600 hover:underline text-sm font-semibold"
//                       >
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

//       {/* Render the modal if a customer is selected */}
//       {selectedCustomer && (
//         <CustomerProfileModal 
//           customer={selectedCustomer} 
//           onClose={() => setSelectedCustomer(null)} 
//         />
//       )}
//     </>
//   );
// };

// export default CustomerList;














import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, SearchInput } from '../common/FormElements';
import { FaTimes } from 'react-icons/fa';
import AppointmentSlipModal from '@/components/appointments/AppointmentSlipModal';

// --- Modal Component for Customer Profile ---
const CustomerProfileModal = ({ customer, onClose }) => {
  if (!customer) return null;

  const lastPurchase = customer.purchases && customer.purchases.length > 0
    ? customer.purchases[customer.purchases.length - 1]
    : null;

  const [latestPrescription, setLatestPrescription] = useState(null);
  const [appointmentsForPatient, setAppointmentsForPatient] = useState([]);
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [selectedApptForSlip, setSelectedApptForSlip] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (!customer || !customer.isPatient) return;
    const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    const loadPrescription = async () => {
      try {
        const resp = await axios.get(`${base}/api/prescriptions/patient/${customer.raw._id}`).catch(() => null);
        let list = resp && Array.isArray(resp.data) ? resp.data : (resp?.data?.prescriptions || []);
        if (!list || !list.length) {
          const all = await axios.get(`${base}/api/prescriptions`).catch(() => ({ data: [] }));
          list = Array.isArray(all.data) ? all.data : (all.data.prescriptions || []);
        }
        const pid = String(customer.raw._id);
        const filtered = (list || []).filter(p => {
          const pId = p.patient_id && (p.patient_id._id || p.patient_id);
          return pId && String(pId) === pid;
        });
        if (filtered.length) {
          filtered.sort((a,b) => (new Date(b.created_at || b.createdAt).getTime() || 0) - (new Date(a.created_at || a.createdAt).getTime() || 0));
          setLatestPrescription(filtered[0]);
        }
      } catch (err) {
        console.debug('presc load failed', err?.message || err);
      }
    };

    const loadAppointments = async () => {
      try {
        const resp = await axios.get(`${base}/api/appointments/patient/${customer.raw._id}`).catch(() => null);
        let list = resp && Array.isArray(resp.data) ? resp.data : (resp?.data?.appointments || []);
        if (!list || !list.length) {
          const all = await axios.get(`${base}/api/appointments`).catch(() => ({ data: [] }));
          list = Array.isArray(all.data) ? all.data : (all.data.appointments || []);
        }
        const pid = String(customer.raw._id);
        const filtered = (list || []).filter(a => {
          const pId = a.patient_id && (a.patient_id._id || a.patient_id);
          return pId && String(pId) === pid;
        });
        setAppointmentsForPatient(filtered);
      } catch (err) {
        console.debug('appt load failed', err?.message || err);
      }
    };

    loadPrescription();
    loadAppointments();
  }, [customer]);

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {
      console.debug('copy failed', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start md:items-center overflow-y-auto z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">{customer.name}</h3>
          <div className="flex items-center gap-3">
            {/* <button onClick={() => handleCopy(customer.email, 'email')} className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">{copiedField === 'email' ? 'Copied' : 'Copy Email'}</button>
            <button onClick={() => handleCopy(customer.phone, 'phone')} className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">{copiedField === 'phone' ? 'Copied' : 'Copy Phone'}</button> */}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="text-sm">
                <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
                <p className="flex items-center gap-2"><strong>Phone:</strong> <a className="text-blue-600 hover:underline" href={`tel:${customer.phone}`}>{customer.phone}</a></p>
                <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
              </div>

              {/* <div>
                <h4 className="font-bold text-gray-700">Appointments</h4>
                {appointmentsForPatient && appointmentsForPatient.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {appointmentsForPatient.map(appt => (
                      <div key={appt._id} className="flex items-center justify-between bg-white border p-2 rounded">
                        <div className="text-sm">
                          <div className="font-medium">{appt.departmentName || appt.type || 'Appointment'}</div>
                          <div className="text-xs text-gray-500">{new Date(appt.appointment_date || appt.created_at).toLocaleString()}</div>
                        </div>
                        <div>
                          <button onClick={() => { setSelectedApptForSlip(appt); setIsSlipOpen(true); }} className="px-3 py-1 bg-blue-600 text-white rounded">View</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">No appointments found for this patient.</p>
                )}
              </div> */}

              <div>
                <h4 className="font-bold text-gray-700">Last Purchase Details</h4>
                {lastPurchase ? (
                  <>
                    <p><strong>Item:</strong> {lastPurchase.itemName}</p>
                    <p><strong>Amount:</strong> ₹{lastPurchase.amount}</p>
                    <p><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        lastPurchase.status === 'paid' ? 'bg-green-100 text-green-700' :
                        lastPurchase.status === 'unpaid' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lastPurchase.status}
                      </span>
                    </p>
                  </>
                ) : (
                  <p>No purchase history found.</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {customer.isPatient && latestPrescription ? (
                <div className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium">Latest Prescription</h4>
                  {latestPrescription.prescription_image ? (
                    <div className="mt-3 max-h-96 overflow-auto border rounded p-2 bg-white">
                      <img src={latestPrescription.prescription_image} alt="Prescription" className="w-full h-auto object-contain" />
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No prescription image available</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <a target="_blank" rel="noreferrer" href={latestPrescription.prescription_image} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Open Image</a>
                    <button onClick={() => handleCopy(latestPrescription.prescription_image, 'presc')} className="px-3 py-1 bg-gray-100 rounded text-sm">{copiedField === 'presc' ? 'Copied' : 'Copy URL'}</button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded border">
                  <h4 className="font-medium">Latest Prescription</h4>
                  <p className="text-xs text-gray-500 mt-2">No prescription image available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* <div className="flex justify-end p-4 border-t">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div> */}

        {isSlipOpen && selectedApptForSlip && (
          <AppointmentSlipModal isOpen={isSlipOpen} onClose={() => setIsSlipOpen(false)} appointmentData={selectedApptForSlip} hospitalInfo={null} />
        )}

      </div>
    </div>
  );
};



// --- Main Customer List Component ---
const CustomerList = ({ setCurrentPage }) => {
  const [customers, setCustomers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const fetchData = async () => {
      try {
        const [custRes, patRes] = await Promise.all([
          axios.get(`${base}/api/customers`),
          axios.get(`${base}/api/patients`)
        ]);
        setCustomers(Array.isArray(custRes.data) ? custRes.data : []);
        setPatients(Array.isArray(patRes.data) ? patRes.data : []);
      } catch (err) {
        setError('Failed to fetch customers or patients.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Combine customers and patients for display
  const combinedList = [
    // map customers to unified shape
    ...customers.map(c => ({
      _id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      purchases: c.purchases || c.purchases || [],
      isPatient: false,
      raw: c
    })),
    // map patients to unified shape
    ...patients.map(p => ({
      _id: p._id,
      name: `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim(),
      email: p.email || '',
      phone: p.phone || p.mobile || '',
      address: p.address || '',
      purchases: [],
      isPatient: true,
      raw: p
    }))
  ];

  const filtered = combinedList.filter(c =>
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="p-6">
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Customer List</h2>
              <p className="text-gray-500">You have total {combinedList.length} Customers.</p>
            </div>
            <Button onClick={() => setCurrentPage('AddCustomerForm')}>
              + Add Customer Sale
            </Button>
          </div>

          <SearchInput
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="overflow-x-auto mt-4">
            {loading && <p className="text-center py-4">Loading customers...</p>}
            {error && <p className="text-center py-4 text-red-500">{error}</p>}
            {!loading && !error && (
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Customer</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Last Purchase</th>
                    <th className="p-3 text-left">Last Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const lastPurchase = c.purchases && c.purchases.length > 0 ? c.purchases[c.purchases.length - 1] : null;
                    return (
                      <tr key={c._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-gray-500">{c.email}</div>
                        </td>
                        <td className="p-3">{c.phone}</td>
                        <td className="p-3">{lastPurchase ? `${lastPurchase.itemName} (x${lastPurchase.quantity})` : (c.isPatient ? '—' : 'N/A')}</td>
                        <td className="p-3">
                          {lastPurchase ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              lastPurchase.status === 'paid' ? 'bg-green-100 text-green-700' :
                              lastPurchase.status === 'unpaid' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {lastPurchase.status}
                            </span>
                          ) : (c.isPatient ? <span className="text-xs text-gray-400">No purchases</span> : null)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="text-blue-600 hover:underline text-sm font-semibold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <CustomerProfileModal 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
        />
      )}
    </>
  );
};

export default CustomerList;