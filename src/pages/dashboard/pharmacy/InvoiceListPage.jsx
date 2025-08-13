// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// // import { SearchInput, Button } from '../common/FormElements';
// import { SearchInput, Button } from  '../../../components/common/FormElements'
// import { PlusIcon, FilterIcon, DownloadIcon, EditIcon, DeleteIcon } from '../../../components/common/Icons';

// const InvoiceListPage = ({ setCurrentPage, setSelectedInvoice }) => {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');

//   useEffect(() => {
//     const fetchInvoices = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/billing');
//         setInvoices(response.data);
//       } catch (err) {
//         setError('Failed to fetch invoices.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInvoices();
//   }, []);

//   const filteredInvoices = invoices.filter(invoice => {
//     const patientName = `${invoice.patient_id?.first_name || ''} ${invoice.patient_id?.last_name || ''}`.trim();
//     const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          patientName.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
//     return matchesSearch && matchesStatus;
//   });

//   const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
//   const paidAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
//   const outstandingAmount = totalAmount - paidAmount;

//   const getStatusBadge = (status) => {
//     const statusClasses = {
//       'Paid': 'bg-green-100 text-green-800',
//       'Pending': 'bg-yellow-100 text-yellow-800',
//       'Partial': 'bg-blue-100 text-blue-800',
//       'Overdue': 'bg-red-100 text-red-800',
//       'Cancelled': 'bg-gray-100 text-gray-800'
//     };
//     return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
//   };

//   const handleViewInvoice = (invoiceId) => {
//     setSelectedInvoice(invoiceId); // Pass the ID to the details page
//     setCurrentPage('InvoiceDetailsPage');
//   };

//   return (
//     <div className="p-6">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//         <div className="p-6 border-b border-gray-100">
//           <div className="flex justify-between items-center mb-4">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
//               <p className="text-gray-600 mt-1">Track and manage patient invoices</p>
//             </div>
//             <div className="flex space-x-2">
//               <Button variant="outline"><DownloadIcon /> Export</Button>
//               <Button variant="primary"><PlusIcon /> Create Invoice</Button>
//             </div>
//           </div>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//             <div className="bg-white border rounded-lg p-4">
//               <div className="text-sm font-medium text-gray-500">Total Invoices</div>
//               <div className="text-2xl font-bold">{filteredInvoices.length}</div>
//             </div>
//             <div className="bg-white border rounded-lg p-4">
//               <div className="text-sm font-medium text-gray-500">Total Amount</div>
//               <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
//             </div>
//             <div className="bg-white border rounded-lg p-4">
//               <div className="text-sm font-medium text-gray-500">Paid Amount</div>
//               <div className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</div>
//             </div>
//             <div className="bg-white border rounded-lg p-4">
//               <div className="text-sm font-medium text-gray-500">Outstanding</div>
//               <div className="text-2xl font-bold text-red-600">${outstandingAmount.toFixed(2)}</div>
//             </div>
//           </div>

//           {/* Search and Filters */}
//           <div className="flex flex-col sm:flex-row gap-4">
//             <SearchInput
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search by invoice number or patient name..."
//               className="flex-1"
//             />
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-lg"
//             >
//               <option value="all">All Status</option>
//               <option value="Paid">Paid</option>
//               <option value="Pending">Pending</option>
//               <option value="Partial">Partial</option>
//             </select>
//           </div>
//         </div>

//         {/* Invoice Table */}
//         <div className="overflow-x-auto">
//           {loading && <p className="text-center py-12">Loading invoices...</p>}
//           {error && <p className="text-center py-12 text-red-500">{error}</p>}
//           {!loading && !error && (
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Invoice #</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Patient</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Due Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y">
//                 {filteredInvoices.map((invoice) => (
//                   <tr key={invoice._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4"><div className="text-sm font-medium">{invoice.invoiceNumber}</div></td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm font-medium">{`${invoice.patient_id?.first_name || ''} ${invoice.patient_id?.last_name || ''}`.trim()}</div>
//                     </td>
//                     <td className="px-6 py-4 text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</td>
//                     <td className="px-6 py-4 text-sm font-bold">${invoice.total.toFixed(2)}</td>
//                     <td className="px-6 py-4"><span className={getStatusBadge(invoice.status)}>{invoice.status}</span></td>
//                     <td className="px-6 py-4">
//                       <div className="flex space-x-2">
//                         <button onClick={() => handleViewInvoice(invoice._id)} className="text-teal-600 hover:text-teal-900">View</button>
//                         <button className="text-gray-400 hover:text-gray-600"><EditIcon /></button>
//                         <button className="text-red-400 hover:text-red-600"><DeleteIcon /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//           {!loading && filteredInvoices.length === 0 && (
//             <div className="text-center py-12 text-gray-500">
//               <h3 className="text-sm font-medium">No invoices found</h3>
//               <p className="mt-1 text-sm">Try adjusting your search or filter criteria.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoiceListPage;

















// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { SearchInput, Button } from '../../../components/common/FormElements';
// import { PlusIcon, FilterIcon, DownloadIcon, EditIcon, DeleteIcon } from '../../../components/common/Icons';

// const InvoiceListPage = ({ setCurrentPage, setSelectedInvoice }) => {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');

//   useEffect(() => {
//     const fetchInvoices = async () => {
//       try {
//         const response = await axios.get('http://localhost:5000/api/billing');
//         setInvoices(response.data);
//       } catch (err) {
//         setError('Failed to fetch invoices.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInvoices();
//   }, []);

//   // --- FIX IS HERE: Added defensive checks ---
//   const filteredInvoices = invoices.filter(invoice => {
//     // Ensure invoice and its properties exist before trying to access them
//     if (!invoice || !invoice.patient_id || !invoice.invoiceNumber) {
//       return false; // Skip malformed invoice data
//     }

//     const patientName = `${invoice.patient_id.first_name || ''} ${invoice.patient_id.last_name || ''}`.trim();
    
//     const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          patientName.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
//     return matchesSearch && matchesStatus;
//   });

//   const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
//   const paidAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
//   const outstandingAmount = totalAmount - paidAmount;

//   const getStatusBadge = (status) => {
//     const statusClasses = {
//       'Paid': 'bg-green-100 text-green-800',
//       'Pending': 'bg-yellow-100 text-yellow-800',
//       'Partial': 'bg-blue-100 text-blue-800',
//       'Overdue': 'bg-red-100 text-red-800',
//       'Cancelled': 'bg-gray-100 text-gray-800'
//     };
//     return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
//   };

//   const handleViewInvoice = (invoiceId) => {
//     setSelectedInvoice(invoiceId);
//     setCurrentPage('InvoiceDetailsPage');
//   };

//   return (
//     <div className="p-6">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//         <div className="p-6 border-b border-gray-100">
//           <div className="flex justify-between items-center mb-4">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
//               <p className="text-gray-600 mt-1">Track and manage patient invoices</p>
//             </div>
//             <div className="flex space-x-2">
//               <Button variant="outline"><DownloadIcon /> Export</Button>
//               <Button variant="primary"><PlusIcon /> Create Invoice</Button>
//             </div>
//           </div>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//             <div className="bg-white border rounded-lg p-4">
//               <div className="text-sm font-medium text-gray-500">Total Invoices</div>
//               <div className="text-2xl font-bold">{filteredInvoices.length}</div>
//             </div>
//             <div className="bg-white border rounded-lg p-4">
//               <div className="text-sm font-medium text-gray-500">Total Amount</div>
//               <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
//             </div>
//             <div className="bg-white border rounded-lg p-4">
//               <div className="text-sm font-medium text-gray-500">Paid Amount</div>
//               <div className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</div>
//             </div>
//             <div className="bg-white border rounded-lg p-4">
//               <div className="text-sm font-medium text-gray-500">Outstanding</div>
//               <div className="text-2xl font-bold text-red-600">${outstandingAmount.toFixed(2)}</div>
//             </div>
//           </div>

//           {/* Search and Filters */}
//           <div className="flex flex-col sm:flex-row gap-4">
//             <SearchInput
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search by invoice number or patient name..."
//               className="flex-1"
//             />
//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-lg"
//             >
//               <option value="all">All Status</option>
//               <option value="Paid">Paid</option>
//               <option value="Pending">Pending</option>
//               <option value="Partial">Partial</option>
//             </select>
//           </div>
//         </div>

//         {/* Invoice Table */}
//         <div className="overflow-x-auto">
//           {loading && <p className="text-center py-12">Loading invoices...</p>}
//           {error && <p className="text-center py-12 text-red-500">{error}</p>}
//           {!loading && !error && (
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Invoice #</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Patient</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Due Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y">
//                 {filteredInvoices.map((invoice) => (
//                   <tr key={invoice._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4"><div className="text-sm font-medium">{invoice.invoiceNumber}</div></td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm font-medium">{`${invoice.patient_id?.first_name || ''} ${invoice.patient_id?.last_name || ''}`.trim()}</div>
//                     </td>
//                     <td className="px-6 py-4 text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</td>
//                     <td className="px-6 py-4 text-sm font-bold">${invoice.total.toFixed(2)}</td>
//                     <td className="px-6 py-4"><span className={getStatusBadge(invoice.status)}>{invoice.status}</span></td>
//                     <td className="px-6 py-4">
//                       <div className="flex space-x-2">
//                         <button onClick={() => handleViewInvoice(invoice._id)} className="text-teal-600 hover:text-teal-900">View</button>
//                         <button className="text-gray-400 hover:text-gray-600"><EditIcon /></button>
//                         <button className="text-red-400 hover:text-red-600"><DeleteIcon /></button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//           {!loading && filteredInvoices.length === 0 && (
//             <div className="text-center py-12 text-gray-500">
//               <h3 className="text-sm font-medium">No invoices found</h3>
//               <p className="mt-1 text-sm">Try adjusting your search or filter criteria.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoiceListPage;















import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SearchInput, Button } from '../../../components/common/FormElements';
import { PlusIcon, FilterIcon, DownloadIcon, EditIcon, DeleteIcon } from '../../../components/common/Icons';
import CreateInvoiceModal from '../../../components/finance/CreateInvoiceModal'; // Make sure this path is correct


const InvoiceListPage = ({ setCurrentPage, setSelectedInvoice }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/billing');
      setInvoices(response.data);
    } catch (err) {
      setError('Failed to fetch invoices.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    if (!invoice || !invoice.patient_id || !invoice.invoiceNumber) return false;
    const patientName = `${invoice.patient_id.first_name || ''} ${invoice.patient_id.last_name || ''}`.trim();
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
  const outstandingAmount = totalAmount - paidAmount;

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-blue-100 text-blue-800',
      'Overdue': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const handleViewInvoice = (invoiceId) => {
    setSelectedInvoice(invoiceId);
    setCurrentPage('InvoiceDetailsPage');
  };

  return (
    <>
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
                <p className="text-gray-600 mt-1">Track and manage patient invoices</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline"><DownloadIcon /> Export</Button>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  <PlusIcon />
                  Create Invoice
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Total Invoices</div>
                <div className="text-2xl font-bold">{filteredInvoices.length}</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Total Amount</div>
                <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Paid Amount</div>
                <div className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Outstanding</div>
                <div className="text-2xl font-bold text-red-600">${outstandingAmount.toFixed(2)}</div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by invoice number or patient name..."
                className="flex-1"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="overflow-x-auto">
            {loading && <p className="text-center py-12">Loading invoices...</p>}
            {error && <p className="text-center py-12 text-red-500">{error}</p>}
            {!loading && !error && (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><div className="text-sm font-medium">{invoice.invoiceNumber}</div></td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{`${invoice.patient_id?.first_name || ''} ${invoice.patient_id?.last_name || ''}`.trim()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-bold">${invoice.total.toFixed(2)}</td>
                      <td className="px-6 py-4"><span className={getStatusBadge(invoice.status)}>{invoice.status}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button onClick={() => handleViewInvoice(invoice._id)} className="text-teal-600 hover:text-teal-900">View</button>
                          <button className="text-gray-400 hover:text-gray-600"><EditIcon /></button>
                          <button className="text-red-400 hover:text-red-600"><DeleteIcon /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filteredInvoices.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <h3 className="text-sm font-medium">No invoices found</h3>
                <p className="mt-1 text-sm">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateInvoiceModal 
          onClose={() => setShowCreateModal(false)}
          onInvoiceCreated={() => {
            fetchInvoices(); // Refresh the list after a new invoice is created
          }}
        />
      )}
    </>
  );
};

export default InvoiceListPage;