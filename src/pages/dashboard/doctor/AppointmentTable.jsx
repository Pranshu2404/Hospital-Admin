// import React from 'react';

// const appointments = [
//   { name: 'Akiko', gender: 'Female', age: 29, time: 'Today, 8:30 AM', diagnosis: 'Wisdom Tooth Removal', status: 'Confirmed' },
//   { name: 'Ashton Cox', gender: 'Male', age: 19, time: 'Yesterday, 10:45 PM', diagnosis: 'Consultation', status: 'Cancelled' },
//   { name: 'Brielle Williamson', gender: 'Male', age: 42, time: 'Nov 25, 10:45 AM', diagnosis: 'Consultation', status: 'Cancelled' },
//   { name: 'Cedric Kelly', gender: 'Male', age: 36, time: 'Yesterday, 9:10 PM', diagnosis: 'Root Canal', status: 'Confirmed' },
//   { name: 'Charde Marshall', gender: 'Female', age: 40, time: 'Nov 23, 9:45 AM', diagnosis: 'Consultation', status: 'Confirmed' },
//   { name: 'Colleen Hurst', gender: 'Female', age: 45, time: 'Nov 23, 10:45 AM', diagnosis: 'Scaling', status: 'Confirmed' },
//   { name: 'Garrett Winters', gender: 'Female', age: 38, time: 'Today, 11:00 AM', diagnosis: 'Scaling', status: 'Confirmed' },
//   { name: 'Haley Kennedy', gender: 'Female', age: 50, time: 'Nov 23, 10:20 AM', diagnosis: 'Wisdom Tooth Removal', status: 'Confirmed' },
//   { name: 'Herrod Chandler', gender: 'Male', age: 33, time: 'Nov 25, 2:45 PM', diagnosis: 'Bleaching', status: 'Confirmed' },
//   { name: 'Jena Gaines', gender: 'Male', age: 30, time: 'Nov 21, 10:05 PM', diagnosis: 'Bleaching', status: 'Confirmed' }
// ];

// const AppointmentTable = () => {
//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="bg-white p-6 rounded-xl shadow-md">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-semibold">Appointments</h2>
//           <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
//             + Add Appointment
//           </button>
//         </div>

//         <div className="flex items-center justify-between mb-4">
//           <label>
//             Show
//             <select className="ml-2 border rounded px-2 py-1">
//               <option>10</option>
//               <option>25</option>
//               <option>50</option>
//             </select>
//             entries
//           </label>
//           <input type="text" placeholder="Search..." className="border rounded px-3 py-1" />
//         </div>

//         <div className="overflow-x-auto">
//           <table className="min-w-full table-auto border rounded-lg overflow-hidden">
//             <thead className="bg-gray-100 text-left">
//               <tr>
//                 <th className="px-4 py-2">Patient Name</th>
//                 <th className="px-4 py-2">Gender</th>
//                 <th className="px-4 py-2">Age</th>
//                 <th className="px-4 py-2">Time</th>
//                 <th className="px-4 py-2">Diagnosis</th>
//                 <th className="px-4 py-2">Status</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {appointments.map((a, idx) => (
//                 <tr key={idx}>
//                   <td className="px-4 py-2">{a.name}</td>
//                   <td className="px-4 py-2">{a.gender}</td>
//                   <td className="px-4 py-2">{a.age}</td>
//                   <td className="px-4 py-2">{a.time}</td>
//                   <td className="px-4 py-2">{a.diagnosis}</td>
//                   <td className={`px-4 py-2 ${a.status === 'Confirmed' ? 'text-green-600' : 'text-red-500'}`}>{a.status}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="flex justify-between items-center mt-4 text-sm">
//           <p>Showing 1 to 10 of 14 entries</p>
//           <div className="flex gap-2">
//             <button className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" disabled>Previous</button>
//             <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
//             <button className="px-3 py-1 bg-white border rounded">2</button>
//             <button className="px-3 py-1 bg-gray-200 rounded">Next</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AppointmentTable;



// import React, { useState } from 'react';
// import AddAppointmentForm from './AddAppointmentForm';

// const initialAppointments = [
//   {
//     name: 'Akiko',
//     diagnosis: 'Wisdom Tooth Removal',
//     status: 'Confirmed',
//   },
//   {
//     name: 'Ashton Cox',
//     diagnosis: 'Consultation',
//     status: 'Cancelled',
//   },
//   {
//     name: 'Brielle Williamson',
//     diagnosis: 'Consultation',
//     status: 'Cancelled',
//   },
//   {
//     name: 'Cedric Kelly',
//     diagnosis: 'Root Canal',
//     status: 'Confirmed',
//   },
//     { name: 'Akiko', gender: 'Female', age: 29, time: 'Today, 8:30 AM', diagnosis: 'Wisdom Tooth Removal', status: 'Confirmed' },
//   { name: 'Ashton Cox', gender: 'Male', age: 19, time: 'Yesterday, 10:45 PM', diagnosis: 'Consultation', status: 'Cancelled' },
//   { name: 'Brielle Williamson', gender: 'Male', age: 42, time: 'Nov 25, 10:45 AM', diagnosis: 'Consultation', status: 'Cancelled' },
//   { name: 'Cedric Kelly', gender: 'Male', age: 36, time: 'Yesterday, 9:10 PM', diagnosis: 'Root Canal', status: 'Confirmed' },
//   { name: 'Charde Marshall', gender: 'Female', age: 40, time: 'Nov 23, 9:45 AM', diagnosis: 'Consultation', status: 'Confirmed' },
//   { name: 'Colleen Hurst', gender: 'Female', age: 45, time: 'Nov 23, 10:45 AM', diagnosis: 'Scaling', status: 'Confirmed' },
//   { name: 'Garrett Winters', gender: 'Female', age: 38, time: 'Today, 11:00 AM', diagnosis: 'Scaling', status: 'Confirmed' },
//   { name: 'Haley Kennedy', gender: 'Female', age: 50, time: 'Nov 23, 10:20 AM', diagnosis: 'Wisdom Tooth Removal', status: 'Confirmed' },
//   { name: 'Herrod Chandler', gender: 'Male', age: 33, time: 'Nov 25, 2:45 PM', diagnosis: 'Bleaching', status: 'Confirmed' },
//   { name: 'Jena Gaines', gender: 'Male', age: 30, time: 'Nov 21, 10:05 PM', diagnosis: 'Bleaching', status: 'Confirmed' }

// ];

// const AppointmentTable = () => {
//   const [appointments, setAppointments] = useState(initialAppointments);
//   const [showForm, setShowForm] = useState(false);

//   const handleSave = (data) => {
//     setAppointments((prev) => [...prev, { ...data, status: 'Confirmed' }]);
//     setShowForm(false);
//   };

//   const getStatusColor = (status) => {
//     return status === 'Confirmed' ? 'text-green-600' : 'text-red-500';
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl shadow">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">Appointments</h2>
//         <button
//           onClick={() => setShowForm(true)}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//         >
//           + Add Appointment
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-sm border border-gray-200 rounded">
//           <thead className="bg-gray-100 text-left">
//             <tr>
//               <th className="p-2">Patient Name</th>
//               <th className="p-2">Diagnosis</th>
//               <th className="p-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {appointments.map((appt, idx) => (
//               <tr key={idx} className="border-t hover:bg-gray-50">
//                 <td className="p-2">{appt.name}</td>
//                 <td className="p-2">{appt.diagnosis}</td>
//                 <td className={`p-2 font-semibold ${getStatusColor(appt.status)}`}>
//                   {appt.status}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal form */}
//       {showForm && (
//         <AddAppointmentForm
//           onClose={() => setShowForm(false)}
//           onSave={handleSave}
//         />
//       )}
//     </div>
//   );
// };

// export default AppointmentTable;





import React, { useState } from 'react';
import AddAppointmentForm from './AddAppointmentForm'; // Ensure this file exists

const appointmentsInitial = [
  { name: 'Akiko', gender: 'Female', age: 29, time: 'Today, 8:30 AM', diagnosis: 'Wisdom Tooth Removal', status: 'Confirmed' },
  { name: 'Ashton Cox', gender: 'Male', age: 19, time: 'Yesterday, 10:45 PM', diagnosis: 'Consultation', status: 'Cancelled' },
  { name: 'Brielle Williamson', gender: 'Male', age: 42, time: 'Nov 25, 10:45 AM', diagnosis: 'Consultation', status: 'Cancelled' },
  { name: 'Cedric Kelly', gender: 'Male', age: 36, time: 'Yesterday, 9:10 PM', diagnosis: 'Root Canal', status: 'Confirmed' },
  { name: 'Charde Marshall', gender: 'Female', age: 40, time: 'Nov 23, 9:45 AM', diagnosis: 'Consultation', status: 'Confirmed' },
  { name: 'Colleen Hurst', gender: 'Female', age: 45, time: 'Nov 23, 10:45 AM', diagnosis: 'Scaling', status: 'Confirmed' },
  { name: 'Garrett Winters', gender: 'Female', age: 38, time: 'Today, 11:00 AM', diagnosis: 'Scaling', status: 'Confirmed' },
  { name: 'Haley Kennedy', gender: 'Female', age: 50, time: 'Nov 23, 10:20 AM', diagnosis: 'Wisdom Tooth Removal', status: 'Confirmed' },
  { name: 'Herrod Chandler', gender: 'Male', age: 33, time: 'Nov 25, 2:45 PM', diagnosis: 'Bleaching', status: 'Confirmed' },
  { name: 'Jena Gaines', gender: 'Male', age: 30, time: 'Nov 21, 10:05 PM', diagnosis: 'Bleaching', status: 'Confirmed' }
];

const AppointmentTable = () => {
  const [appointments, setAppointments] = useState(appointmentsInitial);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (data) => {
    setAppointments(prev => [...prev, { ...data, status: 'Confirmed' }]);
    setShowForm(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Appointments</h2>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            onClick={() => setShowForm(true)}
          >
            + Add Appointment
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <label>
            Show
            <select className="ml-2 border rounded px-2 py-1">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            entries
          </label>
          <input type="text" placeholder="Search..." className="border rounded px-3 py-1" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Patient Name</th>
                <th className="px-4 py-2">Gender</th>
                <th className="px-4 py-2">Age</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Diagnosis</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((a, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2">{a.name}</td>
                  <td className="px-4 py-2">{a.gender}</td>
                  <td className="px-4 py-2">{a.age}</td>
                  <td className="px-4 py-2">{a.time}</td>
                  <td className="px-4 py-2">{a.diagnosis}</td>
                  <td className={`px-4 py-2 ${a.status === 'Confirmed' ? 'text-green-600' : 'text-red-500'}`}>
                    {a.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <p>Showing 1 to 10 of {appointments.length} entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 bg-white border rounded">2</button>
            <button className="px-3 py-1 bg-gray-200 rounded">Next</button>
          </div>
        </div>
      </div>

      {showForm && (
        <AddAppointmentForm
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AppointmentTable;
