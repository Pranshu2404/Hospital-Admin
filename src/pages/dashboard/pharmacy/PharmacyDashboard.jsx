// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   FaPills,
//   FaTruck,
//   FaExclamationTriangle,
//   FaMoneyBillWave,
//   FaPlus,
// } from 'react-icons/fa';
// import apiClient from '../../../api/apiClient'; // Adjust the import path as needed

// import StatCardPharmacy from '../../../components/common/StatCardPharmacy';
// import ExpiredStockModal from './ExpiredStockModal';
// import { QuickActions, LowStockList, RecentSalesTable } from '../../../components/pharmacy/DashboardSections';

// const PharmacyDashboard = () => {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [loading, setLoading] = useState(true);

//     // State for all dashboard data
//     const [dashboardData, setDashboardData] = useState({
//       stats: {
//         medicinesAvailable: '...',
//         totalSuppliers: '...',
//         expiredStockCount: '...',
//         expiringThisMonthCount: '...',
//         expiringNext7DaysCount: '...',
//         todaysRevenue: '...',
//         expiringThisMonthText: '...', // ADDED: For the card's sub-text
//       },
//       lowStockMedicines: [],
//       recentSales: [],
//       expiredMedicines: [],
//       expiringThisMonth: [], 
//     });

//     // --- UPDATED: useEffect to fetch and process live data ---
//     useEffect(() => {
//       const fetchDashboardData = async () => {
//         try {
//           // Fetch all necessary data concurrently for efficiency
//           const [suppliersResponse, medicinesResponse] = await Promise.all([
//             apiClient.get('/api/suppliers'),
//             apiClient.get('/api/pharmacy/medicines') // Assuming this is your medicines endpoint
//           ]);
          
//           const suppliers = suppliersResponse.data;
//           const medicines = medicinesResponse.data;

//           // --- ADDED LOGIC: Calculate expiry dates ---
//           const today = new Date();
//           const currentMonth = today.getMonth();
//           const currentYear = today.getFullYear();
//           today.setHours(0, 0, 0, 0); // Normalize today's date to the start of the day

// const expiredMedicines = medicines.filter(med => new Date(med.expiry_date) < today);
//           const expiringThisMonth = medicines.filter(med => {
//             const expiryDate = new Date(med.expiry_date);
//             return expiryDate.getMonth() === currentMonth && expiryDate.getFullYear() === currentYear && expiryDate >= today;
//           });

//           // Create a display string for medicines expiring this month
//           let expiringThisMonthText = "No medicines expiring this month.";
//           if (expiringThisMonth.length > 0) {
//             const names = expiringThisMonth.map(m => m.name).slice(0, 2).join(', ');
//             expiringThisMonthText = `Expiring: ${names}${expiringThisMonth.length > 2 ? '...' : ''}`;
//           }
          
//           setDashboardData({
//             stats: {
//               medicinesAvailable: medicines.length,
//               totalSuppliers: suppliers.length,
//               expiredStockCount: expiredMedicines.length,
//               todaysRevenue: "$2,450", // Placeholder
//               expiringThisMonthText: expiringThisMonthText, // Set dynamic text
//             },
//             expiredMedicines: expiredMedicines, 
//             expiringThisMonth: expiringThisMonth,
//             // Placeholders for other sections
//             lowStockMedicines: [],
//             recentSales: [],
//           });

//         } catch (error) {
//           console.error("Failed to fetch dashboard data:", error);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchDashboardData();
//     }, []);

//     if (loading) {
//       return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-50">
//           <p className="text-xl font-semibold text-gray-600">Loading Dashboard...</p>
//         </div>
//       );
//     }

//   return (
//     <>
//       <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
//             <p className="text-gray-500 mt-1">Welcome back!</p>
//           </div>
//           <Link to="/dashboard/pharmacy/add-medicine" className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700">
//             <FaPlus />
//             Add New Medicine
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <StatCardPharmacy 
//                 icon={<FaPills className="text-2xl text-blue-600" />}
//                 title="Medicines Available"
//                 value={dashboardData.stats.medicinesAvailable}
//                 change="In Stock"
//                 linkTo="/dashboard/pharmacy/medicine-list"
//             />
//             <StatCardPharmacy 
//                 icon={<FaTruck className="text-2xl text-teal-600" />}
//                 title="Total Suppliers"
//                 value={dashboardData.stats.totalSuppliers}
//                 change="Active Suppliers"
//                 linkTo="/dashboard/pharmacy/suppliers" 
//             />
//             {/* THIS CARD IS NOW FULLY DYNAMIC */}
//             <StatCardPharmacy 
//                 icon={<FaExclamationTriangle className="text-2xl text-orange-600" />}
//                 title="Expiring This Month"
//                 value={dashboardData.stats.expiringThisMonthCount}
//                 change={dashboardData.stats.expiringThisMonthText}
//                 changeColor="text-gray-500"
//                 onClick={() => setIsModalOpen(true)}
//             />
//             <StatCardPharmacy 
//                 icon={<FaMoneyBillWave className="text-2xl text-green-600" />}
//                 title="Today's Revenue"
//                 value={dashboardData.stats.todaysRevenue}
//                 change="↑ 12% from yesterday"
//                 changeColor="text-green-600"
//                 linkTo="/dashboard/pharmacy/invoices"
//             />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
//             <h2 className="font-bold text-lg text-gray-700 mb-4">Sales Overview</h2>
//             <div className="h-80 bg-gray-100 flex items-center justify-center rounded-lg">
//               <p className="text-gray-500">[Sales Chart Placeholder]</p>
//             </div>
//           </div>
//           <div className="space-y-6">
//             <QuickActions />
//             <LowStockList medicines={dashboardData.lowStockMedicines} />
//           </div>
//         </div>

//         <RecentSalesTable sales={dashboardData.recentSales} />
//       </div>
      
//       {isModalOpen && (
//         <ExpiredStockModal 
//           expiredMedicines={dashboardData.expiredMedicines}
//           expiringThisMonth={dashboardData.expiringThisMonth} // Pass the new prop
//           onClose={() => setIsModalOpen(false)} 
//         />
//       )}
//     </>
//   );
// };

// export default PharmacyDashboard;






















// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   FaPills,
//   FaTruck,
//   FaExclamationTriangle,
//   FaMoneyBillWave,
//   FaPlus,
// } from 'react-icons/fa';
// import apiClient from '../../../api/apiClient';

// import StatCardPharmacy from '../../../components/common/StatCardPharmacy';
// import ExpiredStockModal from './ExpiredStockModal';
// import { QuickActions, LowStockList, RecentSalesTable } from '../../../components/pharmacy/DashboardSections';

// const PharmacyDashboard = () => {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [dashboardData, setDashboardData] = useState({
//       stats: {
//         medicinesAvailable: '...',
//         totalSuppliers: '...',
//         expiredStockCount: '...',
//         expiringThisMonthCount: '...',
//         expiringThisMonthText: '...',
//         todaysRevenue: '...',
//       },
//       lowStockMedicines: [],
//       recentSales: [],
//       expiredMedicines: [],
//       expiringThisMonth: [], 
//     });

//     useEffect(() => {
//       const fetchDashboardData = async () => {
//         try {
//           const [suppliersResponse, medicinesResponse] = await Promise.all([
//             apiClient.get('/api/suppliers'),
//             apiClient.get('/api/pharmacy/medicines')
//           ]);
          
//           const suppliers = suppliersResponse.data;
//           const medicines = medicinesResponse.data;

//           // Using the date logic that was working correctly for you
//           const today = new Date();
//           const currentMonth = today.getMonth();
//           const currentYear = today.getFullYear();
//           today.setHours(0, 0, 0, 0);

//           const expiredMedicines = medicines.filter(med => med.expiry_date && new Date(med.expiry_date) < today);
          
//           const expiringThisMonth = medicines.filter(med => {
//             if (!med.expiry_date) return false;
//             const expiryDate = new Date(med.expiry_date);
//             return expiryDate.getMonth() === currentMonth && expiryDate.getFullYear() === currentYear && expiryDate >= today;
//           });

//           // FIXED: Correctly calculate the count for the stat card
//           const expiringThisMonthCount = expiringThisMonth.length;

//           let expiringThisMonthText = "No medicines expiring this month.";
//           if (expiringThisMonth.length > 0) {
//             const names = expiringThisMonth.map(m => m.name).slice(0, 2).join(', ');
//             expiringThisMonthText = `Expiring: ${names}${expiringThisMonth.length > 2 ? '...' : ''}`;
//           }
          
//           setDashboardData({
//             stats: {
//               medicinesAvailable: medicines.length,
//               totalSuppliers: suppliers.length,
//               expiredStockCount: expiredMedicines.length,
//               expiringThisMonthCount: expiringThisMonthCount, // FIXED: Set the count in state
//               todaysRevenue: "$2,450", 
//               expiringThisMonthText: expiringThisMonthText,
//             },
//             expiredMedicines: expiredMedicines, 
//             expiringThisMonth: expiringThisMonth,
//             lowStockMedicines: [
//                 { id: 'med1', name: 'Paracetamol 500mg', stock: 15, supplier: 'Pharma Inc.' },
//             ],
//             recentSales: [
//                 { id: 'S001', name: 'Atorvastatin', amount: '$25.50', status: 'Completed' },
//             ],
//           });

//         } catch (error) {
//           console.error("Failed to fetch dashboard data:", error);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchDashboardData();
//     }, []);

//     if (loading) {
//       return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-50">
//           <p className="text-xl font-semibold text-gray-600">Loading Dashboard...</p>
//         </div>
//       );
//     }

//   return (
//     <>
//       <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
//             <p className="text-gray-500 mt-1">Welcome back!</p>
//           </div>
//           <Link to="/dashboard/pharmacy/add-medicine" className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700">
//             <FaPlus /> Add New Medicine
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <StatCardPharmacy 
//                 icon={<FaExclamationTriangle className="text-2xl text-red-600" />}
//                 title="Expired Medicines"
//                 value={dashboardData.stats.expiredStockCount}
//                 change="View expired stock"
//                 changeColor="text-red-600"
//                 linkTo="/dashboard/pharmacy/expired-medicines"
//             />
//             <StatCardPharmacy 
//                 icon={<FaTruck className="text-2xl text-teal-600" />}
//                 title="Total Suppliers"
//                 value={dashboardData.stats.totalSuppliers}
//                 change="Active Suppliers"
//                 linkTo="/dashboard/pharmacy/suppliers" 
//             />
//             <StatCardPharmacy 
//                 icon={<FaExclamationTriangle className="text-2xl text-orange-600" />}
//                 title="Expiring This Month"
//                 value={dashboardData.stats.expiringThisMonthCount}
//                 change={dashboardData.stats.expiringThisMonthText}
//                 changeColor="text-gray-500"
//                 onClick={() => setIsModalOpen(true)}
//             />
//             <StatCardPharmacy 
//                 icon={<FaMoneyBillWave className="text-2xl text-green-600" />}
//                 title="Today's Revenue"
//                 value={dashboardData.stats.todaysRevenue}
//                 change="↑ 12% from yesterday"
//                 changeColor="text-green-600"
//                 linkTo="/dashboard/pharmacy/invoices"
//             />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
//             <h2 className="font-bold text-lg text-gray-700 mb-4">Sales Overview</h2>
//             <div className="h-80 bg-gray-100 flex items-center justify-center rounded-lg">
//               <p className="text-gray-500">[Sales Chart Placeholder]</p>
//             </div>
//           </div>
//           <div className="space-y-6">
//             <QuickActions />
//             <LowStockList medicines={dashboardData.lowStockMedicines} />
//           </div>
//         </div>

//         <RecentSalesTable sales={dashboardData.recentSales} />
//       </div>
      
//       {isModalOpen && 
//         <ExpiredStockModal 
//           expiringThisMonth={dashboardData.expiringThisMonth}
//           onClose={() => setIsModalOpen(false)} 
//         />
//       }
//     </>
//   );
// };

// export default PharmacyDashboard;






















// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   FaPills,
//   FaTruck,
//   FaExclamationTriangle,
//   FaMoneyBillWave,
//   FaPlus,
// } from 'react-icons/fa';
// import apiClient from '../../../api/apiClient';

// import StatCardPharmacy from '../../../components/common/StatCardPharmacy';
// import ExpiredStockModal from './ExpiredStockModal';
// import { QuickActions } from '../../../components/pharmacy/DashboardSections'; // Or QuickActions.jsx if you renamed it
// import LowStockList from '../../../components/pharmacy/LowStockList';
// import RecentSalesTable from '../../../components/pharmacy/RecentSalesTable';const PharmacyDashboard = () => {
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [dashboardData, setDashboardData] = useState({
//       stats: {
//         totalSuppliers: '...',
//         expiredStockCount: '...',
//         expiringThisMonthCount: '...',
//         todaysRevenue: '...',
//       },
//       lowStockMedicines: [],
//       recentSales: [],
//       expiredMedicines: [],
//       expiringThisMonth: [],
//     });

//     useEffect(() => {
//       const fetchDashboardData = async () => {
//         try {
//           // --- UPDATED: Fetching expired medicines directly ---
//           const [suppliersResponse, allMedicinesResponse, expiredMedicinesResponse] = await Promise.all([
//             apiClient.get('/api/suppliers'),
//             apiClient.get('/api/pharmacy/medicines'),
//             apiClient.get('/api/pharmacy/medicines/expired') // Use the reliable endpoint
//           ]);
          
//           const suppliers = suppliersResponse.data;
//           const allMedicines = allMedicinesResponse.data;
//           const expiredMedicines = expiredMedicinesResponse.data; // This list is now from the backend

//           // Date logic for "Expiring This Month"
//           const today = new Date();
//           const currentMonth = today.getMonth();
//           const currentYear = today.getFullYear();
//           today.setHours(0, 0, 0, 0);
          
//           // We still filter the main list for items expiring this month
//           const expiringThisMonth = allMedicines.filter(med => {
//             if (!med.expiry_date) return false;
//             const expiryDate = new Date(med.expiry_date);
//             return expiryDate.getMonth() === currentMonth && expiryDate.getFullYear() === currentYear && expiryDate >= today;
//           });
          
//           setDashboardData({
//             stats: {
//               totalSuppliers: suppliers.length,
//               expiredStockCount: expiredMedicines.length, // This count is now from the backend
//               expiringThisMonthCount: expiringThisMonth.length,
//               todaysRevenue: "$2,450", 
//             },
//             expiredMedicines: expiredMedicines, // This list is also from the backend
//             expiringThisMonth: expiringThisMonth,
//             lowStockMedicines: [
//                 { id: 'med1', name: 'Paracetamol 500mg', stock: 15, supplier: 'Pharma Inc.' },
//             ],
//             recentSales: [
//                 { id: 'S001', name: 'Atorvastatin', amount: '$25.50', status: 'Completed' },
//             ],
//           });

//         } catch (error) {
//           console.error("Failed to fetch dashboard data:", error);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchDashboardData();
//     }, []);

//     if (loading) {
//       return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-50">
//           <p className="text-xl font-semibold text-gray-600">Loading Dashboard...</p>
//         </div>
//       );
//     }

//   return (
//     <>
//       <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
//             <p className="text-gray-500 mt-1">Welcome back!</p>
//           </div>
//           <Link to="/dashboard/pharmacy/add-medicine" className="mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700">
//             <FaPlus /> Add New Medicine
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <StatCardPharmacy 
//                 icon={<FaExclamationTriangle className="text-2xl text-red-600" />}
//                 title="Expired Medicines"
//                 value={dashboardData.stats.expiredStockCount}
//                 change="View expired stock"
//                 changeColor="text-red-600"
//                 linkTo="/dashboard/pharmacy/expired-medicines"
//             />
//             <StatCardPharmacy 
//                 icon={<FaTruck className="text-2xl text-teal-600" />}
//                 title="Total Suppliers"
//                 value={dashboardData.stats.totalSuppliers}
//                 change="Active Suppliers"
//                 linkTo="/dashboard/pharmacy/suppliers" 
//             />
//             <StatCardPharmacy 
//                 icon={<FaExclamationTriangle className="text-2xl text-orange-600" />}
//                 title="Expiring This Month"
//                 value={dashboardData.stats.expiringThisMonthCount}
//                 change="View expiring items"
//                 changeColor="text-gray-500"
//                 onClick={() => setIsModalOpen(true)}
//             />
//             <StatCardPharmacy 
//                 icon={<FaMoneyBillWave className="text-2xl text-green-600" />}
//                 title="Today's Revenue"
//                 value={dashboardData.stats.todaysRevenue}
//                 change="↑ 12% from yesterday"
//                 changeColor="text-green-600"
//                 linkTo="/dashboard/pharmacy/invoices"
//             />
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
//             <h2 className="font-bold text-lg text-gray-700 mb-4">Sales Overview</h2>
//             <div className="h-80 bg-gray-100 flex items-center justify-center rounded-lg">
//               <p className="text-gray-500">[Sales Chart Placeholder]</p>
//             </div>
//           </div>
//           <div className="space-y-6">
//             <QuickActions />
//             <LowStockList medicines={dashboardData.lowStockMedicines} />
//           </div>
//         </div>

//         <RecentSalesTable sales={dashboardData.recentSales} />
//       </div>
      
//       {isModalOpen && (
//         <ExpiredStockModal 
//           expiringThisMonth={dashboardData.expiringThisMonth}
//           onClose={() => setIsModalOpen(false)} 
//         />
//       )}
//     </>
//   );
// };

// export default PharmacyDashboard;

































import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTruck,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaPlus,
  FaCalendarTimes, // Added for alert bar
} from 'react-icons/fa';
import apiClient from '../../../api/apiClient';

// --- Chart.js Imports ---
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import StatCardPharmacy from '../../../components/common/StatCardPharmacy';
import ExpiredStockModal from './ExpiredStockModal';
import { QuickActions } from '../../../components/pharmacy/DashboardSections';
import LowStockList from '../../../components/pharmacy/LowStockList';
import RecentSalesTable from '../../../components/pharmacy/RecentSalesTable';

// --- Register Chart.js components ---
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- NEW: Blinking Top Bar Alert Component ---
const ExpiryAlertBar = ({ medicines }) => {
  if (!medicines || medicines.length === 0) {
    return null;
  }
  const medicineNames = medicines.map(med => med.name).join(', ');
  return (
    <div className="p-4 border-l-4 rounded-md shadow-md animate-blink-warning mb-6">
      <div className="flex items-center gap-3">
        <FaCalendarTimes className="text-red-600 text-2xl" />
        <div>
          <h3 className="font-bold text-red-800">Expiry Alert!</h3>
          <p className="text-sm text-gray-700">
            The following medicines are expiring in the next 2 days: <strong>{medicineNames}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

const PharmacyDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalSuppliers: '...',
      expiredStockCount: '...',
      expiringThisMonthCount: '...',
      todaysRevenue: '...',
    },
    lowStockMedicines: [],
    expiredMedicines: [],
    expiringThisMonth: [],
    // ADDED: State for medicines expiring very soon
    expiringSoon: [],
  });

  // --- Chart Data & Options ---
  const salesChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        label: 'Sales (₹)',
        data: [12000, 19000, 15000, 21000, 18000, 25000, 23000],
        borderColor: 'rgb(20, 184, 166)', // teal-500
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        fill: true,
        tension: 0.4,
    }],
  };
  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' }, title: { display: false } },
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [suppliersResponse, allMedicinesResponse, expiredMedicinesResponse] = await Promise.all([
          apiClient.get('/api/suppliers'),
          apiClient.get('/api/pharmacy/medicines'),
          apiClient.get('/api/pharmacy/medicines/expired')
        ]);
        
        let allMedicines = allMedicinesResponse.data;
        
        // Dummy data injection to ensure the "expiring soon" alert is visible for demo
        // allMedicines.push(
        //   { _id: 'dummy1', name: 'Crocin Pain Relief', expiry_date: '2025-08-31T00:00:00.000Z' },
        //   { _id: 'dummy2', name: 'Dolo 650', expiry_date: '2025-09-01T00:00:00.000Z' }
        // );

        const suppliers = suppliersResponse.data;
        const expiredMedicines = expiredMedicinesResponse.data;

        // --- Logic for Expiring This Month & Expiring Soon ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const expiringThisMonth = allMedicines.filter(med => {
          if (!med.expiry_date) return false;
          const expiryDate = new Date(med.expiry_date);
          return expiryDate.getMonth() === currentMonth && expiryDate.getFullYear() === currentYear && expiryDate >= today;
        });

        const limitDate = new Date(today);
        limitDate.setDate(today.getDate() + 3); // Medicines expiring today, tomorrow, or the day after

        const expiringSoon = allMedicines.filter(med => {
            if (!med.expiry_date) return false;
            const expiryDate = new Date(med.expiry_date);
            return expiryDate >= today && expiryDate < limitDate;
        });
        
        setDashboardData({
          stats: {
            totalSuppliers: suppliers.length,
            expiredStockCount: expiredMedicines.length,
            expiringThisMonthCount: expiringThisMonth.length,
            todaysRevenue: "₹2,05,450", // MODIFIED: Replaced $ with ₹
          },
          expiredMedicines: expiredMedicines,
          expiringThisMonth: expiringThisMonth,
          expiringSoon: expiringSoon,
          lowStockMedicines: allMedicines.filter(med => med.stock_quantity < 20),
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl font-semibold text-gray-600">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back!</p>
          </div>
          <Link to="/dashboard/pharmacy/add-medicine" className="mt-4 sm:mt-0 flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700">
            <FaPlus /> Add New Medicine
          </Link>
        </div>

        {/* --- NEW: Blinking Top Bar Placed Here --- */}
        <ExpiryAlertBar medicines={dashboardData.expiringSoon} />

        {/* --- RESTORED: Your Original Four Stat Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCardPharmacy 
              icon={<FaExclamationTriangle className="text-2xl text-red-600" />}
              title="Expired Medicines"
              value={dashboardData.stats.expiredStockCount}
              change="View expired stock"
              changeColor="text-red-600"
              linkTo="/dashboard/pharmacy/expired-medicines"
            />
            <StatCardPharmacy 
              icon={<FaTruck className="text-2xl text-teal-600" />}
              title="Total Suppliers"
              value={dashboardData.stats.totalSuppliers}
              change="Active Suppliers"
              linkTo="/dashboard/pharmacy/suppliers" 
            />
            <StatCardPharmacy 
              icon={<FaExclamationTriangle className="text-2xl text-orange-600" />}
              title="Expiring This Month"
              value={dashboardData.stats.expiringThisMonthCount}
              change="View expiring items"
              changeColor="text-gray-500"
              onClick={() => setIsModalOpen(true)}
            />
            <StatCardPharmacy 
              icon={<FaMoneyBillWave className="text-2xl text-teal-600" />}
              title="Today's Revenue"
              value={dashboardData.stats.todaysRevenue}
              change="↑ 12% from yesterday"
              changeColor="text-teal-600"
              linkTo="/dashboard/pharmacy/invoices"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- IMPLEMENTED: Sales Chart --- */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <h2 className="font-bold text-lg text-gray-700 mb-4">Sales Overview</h2>
            <div className="h-80 relative">
              <Line data={salesChartData} options={salesChartOptions} />
            </div>
          </div>
          <div className="space-y-6">
            <QuickActions />
            <LowStockList medicines={dashboardData.lowStockMedicines} />
          </div>
        </div>

        <RecentSalesTable />
      </div>
      
      {isModalOpen && (
        <ExpiredStockModal 
          expiringThisMonth={dashboardData.expiringThisMonth}
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
};

export default PharmacyDashboard;