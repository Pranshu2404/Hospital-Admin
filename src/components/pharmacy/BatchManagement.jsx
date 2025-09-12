import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { 
  FaPlus, 
  FaSearch, 
  FaBox, 
  FaCalendarAlt, 
  FaRupeeSign,
  FaHashtag,
  FaBuilding,
  FaExclamationTriangle,
  FaFilter
} from 'react-icons/fa';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await apiClient.get('/api/batches');
        setBatches(response.data.batches);
      } catch (err) {
        setError('Failed to fetch batches. Please try again later.');
        console.error('Error fetching batches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.medicine_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.batch_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? 
      (statusFilter === 'expiring' ? new Date(batch.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) :
       statusFilter === 'expired' ? new Date(batch.expiry_date) < new Date() :
       statusFilter === 'active' ? batch.quantity > 0 : true) : true;
    
    return matchesSearch && matchesStatus;
  });

  const getBatchStatus = (expiryDate, quantity) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (quantity === 0) return { status: 'Sold Out', color: 'text-gray-600', bg: 'bg-gray-100' };
    if (expiry < today) return { status: 'Expired', color: 'text-red-600', bg: 'bg-red-100' };
    if (expiry < thirtyDaysFromNow) return { status: 'Expiring Soon', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Batch Management</h1>
          <p className="text-gray-600">Manage medicine batches and expiry dates</p>
        </div>
        <Link 
          to="/dashboard/pharmacy/purchasing/create-order"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          <FaPlus /> Receive New Batch
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search batches..."
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
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Showing {filteredBatches.length} of {batches.length} batches
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => {
          const status = getBatchStatus(batch.expiry_date, batch.quantity);
          const expiryDate = new Date(batch.expiry_date);
          const today = new Date();
          const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

          return (
            <div key={batch._id} className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{batch.medicine_id?.name}</h3>
                  <p className="text-sm text-gray-600">Batch: {batch.batch_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                  {status.status}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <span className="font-medium">{batch.quantity} units</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expiry Date:</span>
                  <span className="font-medium">{expiryDate.toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Days Left:</span>
                  <span className={`font-medium ${
                    daysUntilExpiry < 0 ? 'text-red-600' : 
                    daysUntilExpiry < 30 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {daysUntilExpiry < 0 ? 'Expired' : `${daysUntilExpiry} days`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Purchase Price:</span>
                  <span className="font-medium">{formatCurrency(batch.purchase_price)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Selling Price:</span>
                  <span className="font-medium">{formatCurrency(batch.selling_price)}</span>
                </div>

                {batch.supplier_id && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Supplier:</span>
                    <span className="font-medium text-sm">{batch.supplier_id?.name}</span>
                  </div>
                )}
              </div>

              {/* Warning for expiring/expired batches */}
              {(daysUntilExpiry < 30 || daysUntilExpiry < 0) && (
                <div className={`mt-4 p-3 rounded-lg ${
                  daysUntilExpiry < 0 ? 'bg-red-50 border border-red-200' :
                  'bg-orange-50 border border-orange-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className={
                      daysUntilExpiry < 0 ? 'text-red-600' : 'text-orange-600'
                    } />
                    <span className="text-sm font-medium">
                      {daysUntilExpiry < 0 ? 'This batch has expired' : `Expiring in ${daysUntilExpiry} days`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredBatches.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow border">
          <FaBox className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No batches found</p>
          {searchTerm || statusFilter ? (
            <p className="text-sm text-gray-400">Try adjusting your search filters</p>
          ) : (
            <Link 
              to="/dashboard/pharmacy/orders"
              className="text-teal-600 hover:text-teal-700 text-sm"
            >
              Receive your first batch
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchManagement;

// import React, { useState, useEffect } from "react";
// import { Link, useParams } from "react-router-dom";
// import apiClient from "../../api/apiClient";
// import {
//   FaPlus,
//   FaSearch,
//   FaBox,
//   FaExclamationTriangle,
// } from "react-icons/fa";

// const BatchManagement = () => {
//   const { id } = useParams();
//   console.log("THE ID FROM THE URL IS:", id); // <-- ADD THIS LINE

//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

// useEffect(() => {
//   const fetchOrder = async () => {
//     try {
//       const response = await apiClient.get(`/api/orders/purchase/${id}`);
//       setOrder(response.data);
//     } catch (err) {
//       setError("Failed to fetch purchase order. Please try again later.");
//       console.error("Error fetching purchase order:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Only run the fetch if the id exists!
//   if (id) {
//     fetchOrder();
//   }
// }, [id]);

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(amount || 0);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-red-600">
//         {error}
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-gray-600">
//         No order found
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 space-y-6">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Purchase Order</h1>
//           <p className="text-gray-600">
//             Supplier: {order.supplier_id?.name || "Unknown"}
//           </p>
//           <p className="text-gray-600">
//             Created By: {order.created_by?.name || "Unknown"}
//           </p>
//         </div>
//         <Link
//           to="/dashboard/pharmacy/purchasing/create-order"
//           className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
//         >
//           <FaPlus /> New Purchase Order
//         </Link>
//       </div>

//       {/* Items Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {order.items?.map((item, idx) => {
//           const expiryDate = new Date(item.expiry_date);
//           const today = new Date();
//           const daysUntilExpiry = Math.ceil(
//             (expiryDate - today) / (1000 * 60 * 60 * 24)
//           );

//           return (
//             <div
//               key={idx}
//               className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow"
//             >
//               {/* Header */}
//               <div className="flex justify-between items-start mb-4">
//                 <div>
//                   <h3 className="font-semibold text-gray-800">
//                     {item.medicine_id?.name}
//                   </h3>
//                   <p className="text-sm text-gray-600">
//                     Quantity: {item.quantity} units
//                   </p>
//                 </div>
//               </div>

//               {/* Details */}
//               <div className="space-y-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Expiry Date:</span>
//                   <span className="font-medium">
//                     {item.expiry_date
//                       ? expiryDate.toLocaleDateString()
//                       : "N/A"}
//                   </span>
//                 </div>

//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Days Left:</span>
//                   <span
//                     className={`font-medium ${
//                       daysUntilExpiry < 0
//                         ? "text-red-600"
//                         : daysUntilExpiry < 30
//                         ? "text-orange-600"
//                         : "text-green-600"
//                     }`}
//                   >
//                     {item.expiry_date
//                       ? daysUntilExpiry < 0
//                         ? "Expired"
//                         : `${daysUntilExpiry} days`
//                       : "N/A"}
//                   </span>
//                 </div>

//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Purchase Price:</span>
//                   <span className="font-medium">
//                     {formatCurrency(item.price)}
//                   </span>
//                 </div>
//               </div>

//               {/* Warning */}
//               {item.expiry_date && (daysUntilExpiry < 30 || daysUntilExpiry < 0) && (
//                 <div
//                   className={`mt-4 p-3 rounded-lg ${
//                     daysUntilExpiry < 0
//                       ? "bg-red-50 border border-red-200"
//                       : "bg-orange-50 border border-orange-200"
//                   }`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <FaExclamationTriangle
//                       className={
//                         daysUntilExpiry < 0 ? "text-red-600" : "text-orange-600"
//                       }
//                     />
//                     <span className="text-sm font-medium">
//                       {daysUntilExpiry < 0
//                         ? "This batch has expired"
//                         : `Expiring in ${daysUntilExpiry} days`}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Empty Items */}
//       {(!order.items || order.items.length === 0) && (
//         <div className="text-center py-12 bg-white rounded-lg shadow border">
//           <FaBox className="text-4xl text-gray-300 mx-auto mb-4" />
//           <p className="text-gray-500">No items in this order</p>
//           <Link
//             to="/dashboard/pharmacy/purchasing/create-order"
//             className="text-teal-600 hover:text-teal-700 text-sm"
//           >
//             Add items to this order
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BatchManagement;
