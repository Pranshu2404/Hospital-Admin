// // import React from 'react';
// // // We will create these components in the next steps
// // import StatCard from '../dashboard/StatCard';
// // import AppointmentChart from '../dashboard/AppointmentChart';
// // import TopTreatmentsChart from '../dashboard/TopTreatmentsChart';
// // import NextPatientInfo from '../dashboard/NextPatientInfo';
// // import ApprovalRequestList from '../dashboard/ApprovalRequestList';
// // import TodaysAppointments from '../dashboard/TodaysAppointments';
// // import SuccessStatsChart from '../dashboard/SuccessStatsChart';
// // import SummaryCard from '../dashboard/SummaryCard';

// // // You can use a library like 'react-icons' for icons
// // import { FaUserInjured, FaStethoscope, FaDollarSign } from 'react-icons/fa';
// // import { MdOutlineMedicalServices } from 'react-icons/md';


// // const DoctorDashboardSummary = () => {
// //   return (
// //     <div className="p-6 bg-gray-50 min-h-screen">
// //       {/* Header */}
// //       <div className="flex justify-between items-center mb-6">
// //         <h1 className="text-2xl font-bold text-gray-800">Welcome Back, Dr. John!</h1>
// //         {/* You can add the top-right icons here */}
// //       </div>

// //       {/* Main Grid Layout */}
// //       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
// //         {/* Top Stat Cards */}
// //         <div className="col-span-1"><StatCard title="Total Patients" value="180" change="+10%" icon={<FaUserInjured className="text-blue-500" />} /></div>
// //         <div className="col-span-1"><StatCard title="Consultation" value="80" change="+15%" icon={<FaStethoscope className="text-green-500" />} /></div>
// //         <div className="col-span-1"><StatCard title="Procedure" value="50" change="-8%" icon={<MdOutlineMedicalServices className="text-yellow-500" />} /></div>
// //         <div className="col-span-1"><StatCard title="Payment" value="$1,500" change="+13%" icon={<FaDollarSign className="text-red-500" />} /></div>

// //         {/* Middle Section */}
// //         <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow"><TopTreatmentsChart /></div>
// //         <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow"><NextPatientInfo /></div>
// //         <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow"><ApprovalRequestList /></div>
        
// //         {/* Bottom Section */}
// //         <div className="lg:col-span-4 bg-white p-4 rounded-lg shadow"><AppointmentChart /></div>
        
// //         <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow"><TodaysAppointments /></div>
// //         <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow"><SuccessStatsChart /></div>
// //         <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow"><SummaryCard title="Total Patients This Month" value="265" subtitle="Total Patients All Time" subValue="985" /></div>
// //         <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow"><SummaryCard title="Earning" value="$10,150" subtitle="This Month So Far" subValue="$20,000" subDescription="Previous Month" /></div>

// //       </div>
// //     </div>
// //   );
// // };

// // export default DoctorDashboardSummary;




// import React from 'react';
// import { FaUsers, FaMoneyBillWave, FaUserMd, FaCalendarCheck, FaTooth, FaHeart } from 'react-icons/fa';

// const DoctorDashboard = () => {
//   const statCard = (title, value, percent, status, color = 'text-green-600') => (
//     <div className="bg-white rounded-xl shadow p-4 w-full">
//       <div className="text-sm text-gray-500">{title}</div>
//       <div className="text-2xl font-bold">{value}</div>
//       <div className={`text-xs ${color}`}>{status === 'up' ? '↑' : '↓'} {percent}</div>
//       <button className="mt-2 text-blue-600 text-sm">View report</button>
//     </div>
//   );

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold mb-4">Welcome Back, Dr. John!</h1>

//       {/* Top Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {statCard('Total Patients', 180, '10%', 'up')}
//         {statCard('Consultation', 80, '15%', 'up')}
//         {statCard('Procedure', 50, '8%', 'down', 'text-red-600')}
//         {statCard('Payment', '$1,500', '10%', 'up')}
//       </div>

//       {/* Appointment Chart + Top Treatments */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h2 className="font-semibold mb-2">Appointment Overview</h2>
//           {/* Replace this div with <AppointmentChart /> */}
//           <div className="h-56 bg-gray-100 flex items-center justify-center">[Appointment Chart]</div>
//           <div className="flex justify-end mt-4 space-x-2">
//             <button className="text-sm px-3 py-1 border rounded bg-blue-100">Weekly</button>
//             <button className="text-sm px-3 py-1 border rounded bg-blue-500 text-white">Monthly</button>
//             <button className="text-sm px-3 py-1 border rounded bg-blue-100">Yearly</button>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-xl shadow">
//           <h2 className="font-semibold mb-2">Top Treatments</h2>
//           {/* Replace with <TopTreatmentsChart /> */}
//           <div className="h-56 bg-gray-100 flex items-center justify-center">[Pie Chart]</div>
//           <div className="mt-4 text-sm text-gray-600">
//             <ul>
//               <li><span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2" /> Root Canal</li>
//               <li><span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2" /> Wisdom Tooth</li>
//               <li><span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-2" /> Bleaching</li>
//               <li><span className="inline-block w-3 h-3 bg-purple-400 rounded-full mr-2" /> Others</li>
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Patient & Approval */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Next Patient Details */}
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h2 className="font-semibold mb-2">Next Patient Details</h2>
//           <div className="flex items-center gap-4">
//             <img
//               src="https://randomuser.me/api/portraits/women/44.jpg"
//               alt="Patient"
//               className="w-16 h-16 rounded-full"
//             />
//             <div>
//               <div className="font-bold">Sophia</div>
//               <div className="text-sm text-gray-600">Root Canal Treatment</div>
//             </div>
//           </div>
//           <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
//             <div>Patient ID: <span className="font-semibold">124569</span></div>
//             <div>Last Visit: <span className="font-semibold">05.12.2024</span></div>
//             <div>Gender: Female</div>
//             <div>Age: 24</div>
//             <div>Height: 155 cm</div>
//             <div>Weight: 60 kg</div>
//           </div>
//         </div>

//         {/* Approval Requests */}
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h2 className="font-semibold mb-2">Approval Requests</h2>
//           <div className="space-y-2 text-sm">
//             {['Sophia', 'Mason', 'Emily', 'Natalie'].map((name, i) => (
//               <div key={i} className="flex justify-between items-center border p-2 rounded">
//                 <div>
//                   <div className="font-semibold">{name}</div>
//                   <div className="text-gray-500 text-xs">Root Canal Treatment</div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button className="text-green-600">✔</button>
//                   <button className="text-red-600">✖</button>
//                   <button className="text-blue-600">📩</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Bottom Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {/* Today's Appointments */}
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h2 className="font-semibold mb-2">Today's Appointments</h2>
//           <ul className="text-sm space-y-2">
//             {['Consultation', 'Scaling', 'Root Canal', 'Open Access'].map((t, i) => (
//               <li key={i} className="border p-2 rounded flex justify-between">
//                 <span>{t}</span><span>09:00–10:00</span>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Success Stats */}
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h2 className="font-semibold mb-2">Success Stats</h2>
//           <div className="text-center text-2xl font-bold text-green-600 mb-2">90%</div>
//           <div className="h-24 bg-gray-100 flex items-center justify-center">[Line Graph]</div>
//           <p className="text-xs mt-2 text-gray-500">
//             Patient success rate is 90%. Monitored by patient satisfaction and surveys.
//           </p>
//         </div>

//         {/* Total Patients + Earnings */}
//         <div className="bg-white p-4 rounded-xl shadow space-y-4">
//           <div>
//             <div className="text-sm text-gray-500">Total Patients This Month</div>
//             <div className="text-3xl font-bold">265</div>
//           </div>
//           <div>
//             <div className="text-sm text-gray-500">Total Patients All Time</div>
//             <div className="text-3xl font-bold">985</div>
//             <button className="mt-1 text-blue-600 text-sm">View More</button>
//           </div>
//           <div>
//             <div className="text-sm text-gray-500">Earnings</div>
//             <div className="text-xl font-bold">$10,150</div>
//             <div className="text-xs text-gray-500">Previous Month: $20,000</div>
//             <button className="mt-1 text-blue-600 text-sm">View More</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoctorDashboard;






import React from 'react';
import { doctorSidebar } from '../../../constants/sidebarItems/doctorSidebar';
import Layout from '../../../components/Layout';
import DoctorDashboard from './DoctorDashboard'; // adjust if path is different

const DoctorDashboardPage = () => {
  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <DoctorDashboard />
    </Layout>
  );
};

export default DoctorDashboardPage;
