// import React from 'react'
// import Layout from '../../../components/Layout'
// import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar'

// function PharmacyDashboard() {
//   return (
//     <Layout sidebarItems={pharmacySidebar} section="Pharmacy">
//       <div className="flex flex-col items-center justify-center h-screen">
//         <h1 className="text-4xl font-bold mb-4">Pharmacy Dashboard</h1>
//         <p className="text-lg">Welcome to the Pharmacy Dashboard!</p>
//         <p className="text-sm text-gray-500">Manage your pharmacy operations here.</p>
//       </div>
//     </Layout>
//   )
// }

// export default PharmacyDashboard


import Layout from '../../../components/Layout';
import PharmacyDashboard from './PharmacyDashboard';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const Inventory = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <PharmacyDashboard />
    </Layout>
  );
};

export default Inventory;


// import React from 'react';
// import Layout from '../../../components/Layout';
// import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
// import {
//   FaPills,
//   FaLayerGroup,
//   FaExclamationTriangle,
//   FaMoneyBillWave,
//   FaPlus,
//   FaFileInvoice,
//   FaClipboardCheck,
// } from 'react-icons/fa';

// const PharmacyDashboard = () => {
//   // Dummy data for a more detailed demonstration
//   const lowStockMedicines = [
//     { name: 'Paracetamol 500mg', stock: 15, supplier: 'Pharma Inc.' },
//     { name: 'Amoxicillin 250mg', stock: 8, supplier: 'MediSupply' },
//     { name: 'Ibuprofen 200mg', stock: 20, supplier: 'HealthGoods' },
//   ];

//   const recentSales = [
//     { id: 'S001', name: 'Atorvastatin', amount: '$25.50', status: 'Completed' },
//     { id: 'S002', name: 'Lisinopril', amount: '$15.00', status: 'Completed' },
//     { id: 'S003', name: 'Metformin', amount: '$18.75', status: 'Completed' },
//     { id: 'S004', name: 'Amlodipine', amount: '$12.20', status: 'Pending' },
//   ];

//   return (
//     <Layout sidebarItems={pharmacySidebar} section="Pharmacy">
//       <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
//             <p className="text-gray-500">Welcome back, manage your pharmacy operations efficiently.</p>
//           </div>
//           <button className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
//             <FaPlus />
//             Add New Medicine
//           </button>
//         </div>

//         {/* Enhanced Stat Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-white rounded-xl shadow-md p-5">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
//                 <FaPills className="text-2xl" />
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Medicines Available</div>
//                 <div className="text-2xl font-bold text-gray-800">1,250</div>
//               </div>
//             </div>
//             <div className="text-xs text-green-600 mt-2">↑ 5% from last week</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-md p-5">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mr-4">
//                 <FaLayerGroup className="text-2xl" />
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Medicine Groups</div>
//                 <div className="text-2xl font-bold text-gray-800">85</div>
//               </div>
//             </div>
//             <div className="text-xs text-gray-500 mt-2">No change</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-md p-5">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
//                 <FaExclamationTriangle className="text-2xl" />
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Expired Stock</div>
//                 <div className="text-2xl font-bold text-gray-800">12</div>
//               </div>
//             </div>
//             <div className="text-xs text-red-600 mt-2">2 new items today</div>
//           </div>
//           <div className="bg-white rounded-xl shadow-md p-5">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
//                 <FaMoneyBillWave className="text-2xl" />
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Today's Revenue</div>
//                 <div className="text-2xl font-bold text-gray-800">$2,450</div>
//               </div>
//             </div>
//             <div className="text-xs text-green-600 mt-2">↑ 12% from yesterday</div>
//           </div>
//         </div>

//         {/* Main Content Area */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
//             <h2 className="font-bold text-lg text-gray-700 mb-4">Sales Overview</h2>
//             <div className="h-80 bg-gray-100 flex items-center justify-center rounded-lg text-gray-500">[Sales Chart Placeholder]</div>
//           </div>

//           <div className="space-y-6">
//             <div className="bg-white p-6 rounded-xl shadow-md">
//               <h2 className="font-bold text-lg text-gray-700 mb-4">Quick Actions</h2>
//               <div className="space-y-3">
//                 <button className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"><FaClipboardCheck className="text-blue-500" /> Process New Prescriptions</button>
//                 <button className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"><FaFileInvoice className="text-green-500" /> Generate Daily Report</button>
//               </div>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-md">
//               <h2 className="font-bold text-lg text-red-600 mb-4">Low Stock Medicines</h2>
//               <div className="space-y-3">
//                 {lowStockMedicines.map((med, i) => (
//                   <div key={i} className="flex justify-between items-center">
//                     <div>
//                       <div className="font-semibold text-gray-800">{med.name}</div>
//                       <div className="text-sm text-gray-500">{med.supplier}</div>
//                     </div>
//                     <div className="font-bold text-red-700">{med.stock} left</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Sales Table */}
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <h2 className="font-bold text-lg text-gray-700 mb-4">Recent Sales</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm text-left">
//               <thead className="text-xs text-gray-700 uppercase bg-gray-100 rounded-t-lg">
//                 <tr>
//                   <th scope="col" className="px-6 py-3">Sale ID</th>
//                   <th scope="col" className="px-6 py-3">Medicine</th>
//                   <th scope="col" className="px-6 py-3">Amount</th>
//                   <th scope="col" className="px-6 py-3">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentSales.map((sale) => (
//                   <tr key={sale.id} className="bg-white border-b hover:bg-gray-50">
//                     <td className="px-6 py-4 font-medium text-gray-900">{sale.id}</td>
//                     <td className="px-6 py-4">{sale.name}</td>
//                     <td className="px-6 py-4">{sale.amount}</td>
//                     <td className="px-6 py-4">
//                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                         sale.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
//                       }`}>{sale.status}</span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default PharmacyDashboard;