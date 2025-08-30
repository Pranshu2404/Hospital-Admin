// import React, { useState, useEffect } from 'react';
// import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

// // --- Reusable Modal Component ---
// const SupplierModal = ({ mode, supplier, onClose, onSubmit }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     contactPerson: '',
//     phone: '',
//     email: '',
//     address: '',
//   });

//   useEffect(() => {
//     // If we are in 'edit' mode, pre-fill the form with the supplier's data
//     if (mode === 'edit' && supplier) {
//       setFormData({
//         name: supplier.name || '',
//         contactPerson: supplier.contactPerson || '',
//         phone: supplier.phone || '',
//         email: supplier.email || '',
//         address: supplier.address || '',
//       });
//     }
//   }, [mode, supplier]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
//         <div className="flex justify-between items-center p-5 border-b">
//           <h3 className="text-xl font-bold text-gray-800">
//             {mode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
//           </h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
//             <FaTimes size={20} />
//           </button>
//         </div>
//         <form onSubmit={handleSubmit}>
//           <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//             {/* Form Fields */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
//               <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Contact Person</label>
//               <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Phone</label>
//               <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Email</label>
//               <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Address</label>
//               <textarea name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
//             </div>
//           </div>
//           <div className="flex justify-end p-5 border-t gap-3">
//             <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">
//               Cancel
//             </button>
//             <button type="submit" className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">
//               {mode === 'add' ? 'Add Supplier' : 'Save Changes'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };


// // --- Main Page Component ---
// const SuppliersListPage = () => {
//   const [suppliers, setSuppliers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   // State for Modal and Form
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
//   const [currentSupplier, setCurrentSupplier] = useState(null);
  
//   // State for user feedback
//   const [notification, setNotification] = useState({ message: '', type: '' });

//   // --- Data Fetching ---
//   useEffect(() => {
//     fetchSuppliers();
//   }, []);

//   const fetchSuppliers = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/suppliers');
//       if (!response.ok) throw new Error('Failed to fetch data.');
//       const data = await response.json();
//       setSuppliers(data);
//     } catch (err) {
//       setError(err.message);
//       showNotification(err.message, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // --- UI Feedback ---
//   const showNotification = (message, type) => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification({ message: '', type: '' }), 3000); // Hide after 3 seconds
//   };
  
//   // --- CRUD Handlers ---
//   const handleOpenModal = (mode, supplier = null) => {
//     setModalMode(mode);
//     setCurrentSupplier(supplier);
//     setIsModalOpen(true);
//   };
  
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setCurrentSupplier(null);
//   };

//   const handleFormSubmit = async (formData) => {
//     const url = modalMode === 'add' ? '/api/suppliers' : `/api/suppliers/${currentSupplier._id}`;
//     const method = modalMode === 'add' ? 'POST' : 'PUT';

//     try {
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Operation failed.');
//       }
      
//       const savedSupplier = await response.json();

//       if (modalMode === 'add') {
//         setSuppliers(prev => [...prev, savedSupplier]);
//         showNotification('Supplier added successfully!', 'success');
//       } else {
//         setSuppliers(prev => prev.map(s => s._id === savedSupplier._id ? savedSupplier : s));
//         showNotification('Supplier updated successfully!', 'success');
//       }
      
//       handleCloseModal();
//     } catch (err) {
//       showNotification(err.message, 'error');
//     }
//   };

//   const handleDeactivate = async (supplierId) => {
//     if (window.confirm('Are you sure you want to deactivate this supplier?')) {
//       try {
//         const response = await fetch(`/api/suppliers/${supplierId}`, { method: 'DELETE' });
//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || 'Failed to deactivate.');
//         }
//         setSuppliers(prev => prev.filter(s => s._id !== supplierId));
//         showNotification('Supplier deactivated successfully.', 'success');
//       } catch (err) {
//         showNotification(err.message, 'error');
//       }
//     }
//   };

//   const filteredSuppliers = suppliers.filter(supplier =>
//     supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <>
//       {isModalOpen && (
//         <SupplierModal
//           mode={modalMode}
//           supplier={currentSupplier}
//           onClose={handleCloseModal}
//           onSubmit={handleFormSubmit}
//         />
//       )}
//       <div className="p-6 bg-gray-50 min-h-screen">
//         {/* Notification Area */}
//         {notification.message && (
//           <div className={`p-4 mb-4 rounded-md text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
//             {notification.message}
//           </div>
//         )}

//         <div className="bg-white p-6 rounded-xl shadow-md">
//           {/* Header Section */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
//               <p className="text-gray-500 mt-1">Manage all your medicine suppliers.</p>
//             </div>
//             <div className="flex items-center mt-4 sm:mt-0 gap-4 w-full sm:w-auto">
//               <div className="relative w-full sm:w-64">
//                   <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
//                   <input
//                       type="text"
//                       placeholder="Search suppliers..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
//                   />
//               </div>
//               <button onClick={() => handleOpenModal('add')} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 whitespace-nowrap">
//                 <FaPlus /> Add Supplier
//               </button>
//             </div>
//           </div>

//           {/* Suppliers Table */}
//           <div className="overflow-x-auto">
//             {loading ? (
//               <p className="text-center py-10">Loading suppliers...</p>
//             ) : error ? (
//               <p className="text-center py-10 text-red-500">Error: {error}</p>
//             ) : (
//               <table className="w-full text-sm text-left">
//                 <thead className="text-xs text-gray-700 uppercase bg-gray-100">
//                   <tr>
//                     <th scope="col" className="px-6 py-3">Supplier Name</th>
//                     <th scope="col" className="px-6 py-3">Contact Person</th>
//                     <th scope="col" className="px-6 py-3">Phone</th>
//                     <th scope="col" className="px-6 py-3">Email</th>
//                     <th scope="col" className="px-6 py-3">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredSuppliers.map((supplier) => (
//                     <tr key={supplier._id} className="bg-white border-b hover:bg-gray-50">
//                       <td className="px-6 py-4 font-medium text-gray-900">{supplier.name}</td>
//                       <td className="px-6 py-4">{supplier.contactPerson || 'N/A'}</td>
//                       <td className="px-6 py-4">{supplier.phone}</td>
//                       <td className="px-6 py-4">{supplier.email}</td>
//                       <td className="px-6 py-4 flex items-center gap-4">
//                         <button onClick={() => handleOpenModal('edit', supplier)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
//                         <button onClick={() => handleDeactivate(supplier._id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//             {!loading && filteredSuppliers.length === 0 && (
//               <div className="text-center py-10 text-gray-500">No suppliers found.</div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default SuppliersListPage;





















import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import apiClient from '../../../api/apiClient'; // Adjust the import path as needed

// --- Reusable Modal Component (Now only for editing) ---
const SupplierEditModal = ({ supplier, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '', contactPerson: '', phone: '', email: '', address: '',
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
      });
    }
  }, [supplier]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-bold text-gray-800">Edit Supplier</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Supplier Name" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Contact Person" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
          </div>
          <div className="flex justify-end p-5 border-t gap-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main Page Component ---
const SuppliersListPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch suppliers.';
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleOpenEditModal = (supplier) => {
    setCurrentSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setCurrentSupplier(null);
  };

  const handleUpdateSubmit = async (formData) => {
    try {
      const response = await apiClient.put(`/api/suppliers/${currentSupplier._id}`, formData);
      setSuppliers(prev => prev.map(s => s._id === response.data._id ? response.data : s));
      showNotification('Supplier updated successfully!', 'success');
      handleCloseModal();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Update failed.';
      showNotification(errorMsg, 'error');
    }
  };

  const handleDeactivate = async (supplierId) => {
    if (window.confirm('Are you sure you want to deactivate this supplier?')) {
      try {
        await apiClient.delete(`/api/suppliers/${supplierId}`);
        setSuppliers(prev => prev.filter(s => s._id !== supplierId));
        showNotification('Supplier deactivated successfully.', 'success');
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to deactivate.';
        showNotification(errorMsg, 'error');
      }
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {isEditModalOpen && <SupplierEditModal supplier={currentSupplier} onClose={handleCloseModal} onSubmit={handleUpdateSubmit} />}
      <div className="p-6 bg-gray-50 min-h-screen">
        {notification.message && <div className={`p-4 mb-4 rounded-md text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{notification.message}</div>}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
              <p className="text-gray-500 mt-1">Manage all your medicine suppliers.</p>
            </div>
            <div className="flex items-center mt-4 sm:mt-0 gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search suppliers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 p-2 border border-gray-300 rounded-lg" />
              </div>
              {/* THIS BUTTON IS NOW A LINK FOR NAVIGATION */}
              <Link to="/dashboard/pharmacy/add-supplier" className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-teal-700 whitespace-nowrap">
                <FaPlus /> Add Supplier
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? <p className="text-center py-10">Loading suppliers...</p> : error ? <p className="text-center py-10 text-red-500">{error}</p> : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">Supplier Name</th>
                    <th scope="col" className="px-6 py-3">Contact Person</th>
                    <th scope="col" className="px-6 py-3">Phone</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier._id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{supplier.name}</td>
                      <td className="px-6 py-4">{supplier.contactPerson || 'N/A'}</td>
                      <td className="px-6 py-4">{supplier.phone}</td>
                      <td className="px-6 py-4">{supplier.email}</td>
                      <td className="px-6 py-4 flex items-center gap-4">
                        <button onClick={() => handleOpenEditModal(supplier)} className="text-teal-600 hover:text-teal-800"><FaEdit /></button>
                        <button onClick={() => handleDeactivate(supplier._id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && filteredSuppliers.length === 0 && <div className="text-center py-10 text-gray-500">No suppliers found.</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default SuppliersListPage;