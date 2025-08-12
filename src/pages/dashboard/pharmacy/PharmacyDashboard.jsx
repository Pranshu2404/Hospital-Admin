// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   FaPills,
//   FaTruck,
//   FaExclamationTriangle,
//   FaMoneyBillWave,
//   FaPlus,
//   FaFileInvoice,
//   FaClipboardCheck,
//   FaTimes,
// } from 'react-icons/fa'; // Changed 'fa6' back to 'fa' to resolve the import error

// // --- Helper function to get today's date in YYYY-MM-DD format ---
// const getTodayDateString = () => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = String(today.getMonth() + 1).padStart(2, '0');
//   const day = String(today.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };


// // --- Modal Component for Expired Stock ---
// const ExpiredStockModal = ({ medicines, onClose }) => {
//   const [showExpiringToday, setShowExpiringToday] = useState(false);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0); // Set to the beginning of the day for accurate comparison
//   const todayDateString = getTodayDateString();

//   const allExpired = medicines.filter(med => new Date(med.expireDate) < today);
//   const expiringToday = medicines.filter(med => med.expireDate === todayDateString);

//   const medicinesToShow = showExpiringToday ? expiringToday : allExpired;
//   const title = showExpiringToday ? "Medicines Expiring Today" : "Expired Medicines";

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
//         <div className="flex justify-between items-center p-5 border-b">
//           <h3 className="text-xl font-bold text-gray-800">{title}</h3>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
//             <FaTimes size={20} />
//           </button>
//         </div>
//         <div className="p-5">
//           <div className="flex justify-end mb-4">
//             <button
//               onClick={() => setShowExpiringToday(!showExpiringToday)}
//               className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-colors text-sm"
//             >
//               {showExpiringToday ? 'Show All Expired' : 'Show Expiring Today'}
//             </button>
//           </div>
//           <div className="overflow-y-auto max-h-80">
//             <table className="min-w-full border border-gray-200 text-sm">
//               <thead className="bg-gray-100 sticky top-0">
//                 <tr>
//                   <th className="px-4 py-2 border text-left">Name</th>
//                   <th className="px-4 py-2 border text-left">Manufacturer</th>
//                   <th className="px-4 py-2 border text-left">Stock</th>
//                   <th className="px-4 py-2 border text-left">Expire Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {medicinesToShow.length > 0 ? (
//                   medicinesToShow.map((med) => (
//                     <tr key={med.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-2 border">{med.name}</td>
//                       <td className="px-4 py-2 border">{med.manufacturer}</td>
//                       <td className="px-4 py-2 border">{med.stock}</td>
//                       <td className="px-4 py-2 border font-medium text-red-700">{med.expireDate}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="4" className="text-center py-4 text-gray-500">
//                       {showExpiringToday ? 'No medicines are expiring today.' : 'No expired medicines found.'}
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// const PharmacyDashboard = () => {
//     // --- State ---
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     // --- Dummy Data ---
//     const allMedicines = [
//         { id: 1, name: 'Expired Med A', manufacturer: 'Old Pharma', stock: 50, expireDate: '2024-01-15' },
//         { id: 2, name: 'Expired Med B', manufacturer: 'Health Co', stock: 25, expireDate: '2023-11-30' },
//         { id: 3, name: 'Med Expiring Today', manufacturer: 'Fresh Meds', stock: 10, expireDate: getTodayDateString() },
//         { id: 4, name: 'Another Expiring Today', manufacturer: 'Health Co', stock: 5, expireDate: getTodayDateString() },
//         { id: 5, name: 'Good Med C', manufacturer: 'Good Pharma', stock: 100, expireDate: '2026-12-31' },
//     ];

//     const lowStockMedicines = [
//         { id: 'med1', name: 'Paracetamol 500mg', stock: 15, supplier: 'Pharma Inc.' },
//         { id: 'med2', name: 'Amoxicillin 250mg', stock: 8, supplier: 'MediSupply' },
//         { id: 'med3', name: 'Ibuprofen 200mg', stock: 20, supplier: 'HealthGoods' },
//     ];

//     const recentSales = [
//         { id: 'S001', name: 'Atorvastatin', amount: '$25.50', status: 'Completed' },
//         { id: 'S002', name: 'Lisinopril', amount: '$15.00', status: 'Completed' },
//     ];

//     const expiredStockCount = allMedicines.filter(med => new Date(med.expireDate) < new Date(getTodayDateString())).length;

//   return (
//     <>
//       <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
//             <p className="text-gray-500 mt-1">Welcome back, manage your pharmacy operations efficiently.</p>
//           </div>
//           <Link to="/dashboard/pharmacy/add-medicine" className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">
//             <FaPlus />
//             Add New Medicine
//           </Link>
//         </div>

//         {/* Enhanced Stat Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
//           {/* Card 1: Medicines Available - Linked */}
//           <Link to="/dashboard/pharmacy/medicine-list" className="block transform hover:-translate-y-1 transition-transform duration-300">
//             <div className="bg-white rounded-xl shadow-md p-5 h-full">
//               <div className="flex items-center">
//                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
//                   <FaPills className="text-2xl" />
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-500">Medicines Available</div>
//                   <div className="text-2xl font-bold text-gray-800">1,250</div>
//                 </div>
//               </div>
//               <div className="text-xs text-green-600 mt-2">↑ 5% from last week</div>
//             </div>
//           </Link>
          
//           {/* Card 2: Total Suppliers (Replaced Medicine Groups) */}
//           <div className="bg-white rounded-xl shadow-md p-5">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mr-4">
//                 <FaTruck className="text-2xl" />
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Total Suppliers</div>
//                 <div className="text-2xl font-bold text-gray-800">42</div>
//               </div>
//             </div>
//             <div className="text-xs text-gray-500 mt-2">2 new suppliers</div>
//           </div>
          
//           {/* Card 3: Expired Stock - Clickable */}
//           <button onClick={() => setIsModalOpen(true)} className="text-left bg-white rounded-xl shadow-md p-5 transform hover:-translate-y-1 transition-transform duration-300">
//             <div className="flex items-center">
//               <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
//                 <FaExclamationTriangle className="text-2xl" />
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Expired Stock</div>
//                 <div className="text-2xl font-bold text-gray-800">{expiredStockCount}</div>
//               </div>
//             </div>
//             <div className="text-xs text-red-600 mt-2">{allMedicines.filter(med => med.expireDate === getTodayDateString()).length} expiring today</div>
//           </button>
          
//           {/* Card 4: Today's Revenue */}
//            <Link to="/dashboard/pharmacy/invoices" className="block transform hover:-translate-y-1 transition-transform duration-300">
//               <div className="bg-white rounded-xl shadow-md p-5 h-full">
//                   <div className="flex items-center">
//                       <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
//                       <FaMoneyBillWave className="text-2xl" />
//                       </div>
//                       <div>
//                       <div className="text-sm text-gray-500">Today's Revenue</div>
//                       <div className="text-2xl font-bold text-gray-800">$2,450</div>
//                       </div>
//                   </div>
//                   <div className="text-xs text-green-600 mt-2">↑ 12% from yesterday</div>
//               </div>
//           </Link>
//         </div>

//         {/* Main Content Area */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
//             <h2 className="font-bold text-lg text-gray-700 mb-4">Sales Overview</h2>
//             <div className="h-80 bg-gray-100 flex items-center justify-center rounded-lg">
//               <p className="text-gray-500">[Sales Chart Placeholder]</p>
//             </div>
//           </div>

//           <div className="space-y-6">
//             <div className="bg-white p-6 rounded-xl shadow-md">
//               <h2 className="font-bold text-lg text-gray-700 mb-4">Quick Actions</h2>
//               <div className="space-y-3">
//                 <button className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"><FaClipboardCheck className="text-blue-500" /> Process New Prescriptions</button>
//                 <button className="w-full flex items-center gap-3 text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"><FaFileInvoice className="text-green-500" /> Generate Daily Report</button>
//               </div>
//             </div>
//             <div className="bg-white p-6 rounded-xl shadow-md">
//               <h2 className="font-bold text-lg text-red-600 mb-4">Low Stock Medicines</h2>
//               <div className="space-y-3">
//                 {lowStockMedicines.map((med) => (
//                   <div key={med.id} className="flex justify-between items-center">
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
      
//       {/* Render the modal if isModalOpen is true */}
//       {isModalOpen && <ExpiredStockModal medicines={allMedicines} onClose={() => setIsModalOpen(false)} />}
//     </>
//   );
// };

// export default PharmacyDashboard;






























import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPills,
  FaTruck,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaPlus,
} from 'react-icons/fa';

// Import the new components
import StatCard from '../../../components/pharmacy/StatCard';
import ExpiredStockModal from './ExpiredStockModal';
import { QuickActions, LowStockList, RecentSalesTable } from '../../../components/pharmacy/DashboardSections';

// Helper function to get today's date
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const PharmacyDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Dummy Data (This would typically come from an API)
    const allMedicines = [
        { id: 1, name: 'Expired Med A', manufacturer: 'Old Pharma', stock: 50, expireDate: '2024-01-15' },
        { id: 3, name: 'Med Expiring Today', manufacturer: 'Fresh Meds', stock: 10, expireDate: getTodayDateString() },
    ];
    const lowStockMedicines = [
        { id: 'med1', name: 'Paracetamol 500mg', stock: 15, supplier: 'Pharma Inc.' },
        { id: 'med2', name: 'Amoxicillin 250mg', stock: 8, supplier: 'MediSupply' },
    ];
    const recentSales = [
        { id: 'S001', name: 'Atorvastatin', amount: '$25.50', status: 'Completed' },
        { id: 'S002', name: 'Lisinopril', amount: '$15.00', status: 'Completed' },
    ];

    const expiredStockCount = allMedicines.filter(med => new Date(med.expireDate) < new Date(getTodayDateString())).length;
    const expiringTodayCount = allMedicines.filter(med => med.expireDate === getTodayDateString()).length;

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back!</p>
          </div>
          <Link to="/dashboard/pharmacy/add-medicine" className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700">
            <FaPlus />
            Add New Medicine
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                icon={<FaPills className="text-2xl text-blue-600" />}
                title="Medicines Available"
                value="1,250"
                change="↑ 5% from last week"
                changeColor="text-green-600"
                linkTo="/dashboard/pharmacy/medicine-list"
            />
            <StatCard 
                icon={<FaTruck className="text-2xl text-teal-600" />}
                title="Total Suppliers"
                value="42"
                change="2 new suppliers"
            />
            <StatCard 
                icon={<FaExclamationTriangle className="text-2xl text-red-600" />}
                title="Expired Stock"
                value={expiredStockCount}
                change={`${expiringTodayCount} expiring today`}
                changeColor="text-red-600"
                onClick={() => setIsModalOpen(true)}
            />
            <StatCard 
                icon={<FaMoneyBillWave className="text-2xl text-green-600" />}
                title="Today's Revenue"
                value="$2,450"
                change="↑ 12% from yesterday"
                changeColor="text-green-600"
                linkTo="/dashboard/pharmacy/invoices"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h2 className="font-bold text-lg text-gray-700 mb-4">Sales Overview</h2>
            <div className="h-80 bg-gray-100 flex items-center justify-center rounded-lg">
              <p className="text-gray-500">[Sales Chart Placeholder]</p>
            </div>
          </div>
          <div className="space-y-6">
            <QuickActions />
            <LowStockList medicines={lowStockMedicines} />
          </div>
        </div>

        <RecentSalesTable sales={recentSales} />
      </div>
      
      {isModalOpen && <ExpiredStockModal medicines={allMedicines} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default PharmacyDashboard;