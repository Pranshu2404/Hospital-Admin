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

// --- Modal Component for Customer Profile ---
const CustomerProfileModal = ({ customer, onClose }) => {
  if (!customer) return null;

  // Get the most recent purchase from the purchases array
  const lastPurchase = customer.purchases && customer.purchases.length > 0
    ? customer.purchases[customer.purchases.length - 1]
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">{customer.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <p><strong>Email:</strong> {customer.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
          <hr className="my-3"/>
          <h4 className="font-bold text-gray-700">Last Purchase Details</h4>
          {lastPurchase ? (
            <>
              <p><strong>Item:</strong> {lastPurchase.itemName}</p>
              <p><strong>Amount:</strong> ${lastPurchase.amount}</p>
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
        <div className="flex justify-end p-4 border-t">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};


// --- Main Customer List Component ---
const CustomerList = ({ setCurrentPage }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/customers');
        setCustomers(response.data);
      } catch (err) {
        setError('Failed to fetch customers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="p-6">
        <div className="bg-white shadow rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Customer List</h2>
              <p className="text-gray-500">You have total {customers.length} Customers.</p>
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
                      <tr key={c._id} className="border-b">
                        <td className="p-3">
                          {c.name}
                          <br />
                          <span className="text-xs text-gray-500">{c.email}</span>
                        </td>
                        <td className="p-3">{c.phone}</td>
                        <td className="p-3">{lastPurchase ? `${lastPurchase.itemName} (x${lastPurchase.quantity})` : 'N/A'}</td>
                        <td className="p-3">
                          {lastPurchase && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              lastPurchase.status === 'paid' ? 'bg-green-100 text-green-700' :
                              lastPurchase.status === 'unpaid' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {lastPurchase.status}
                            </span>
                          )}
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