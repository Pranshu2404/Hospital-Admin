import React from 'react';
import {
  FaUsers,
  FaUserMd,
  FaCalendarCheck,
  FaTooth,
  FaHeart,
} from 'react-icons/fa';
// REMOVED: FaMoneyBillWave as it's no longer used

const DoctorDashboard = () => {
  return (
    <div>
     <h1 className="text-2xl font-bold p-4 bg-white text-gray-800">Welcome Back, Dr. John!</h1> 

    <div className="p-4 space-y-6 bg-gray-50 min-h-screen">

      {/* Stat Cards - Payment card is now Today's Appointments */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4 flex items-center">
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mr-4">
            <FaUsers className="text-xl" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Patients</div>
            <div className="text-xl font-bold text-gray-800">180</div>
            <div className="text-xs text-green-600">↑ 10%</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 flex items-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
            <FaCalendarCheck className="text-xl" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Consultation</div>
            <div className="text-xl font-bold text-gray-800">80</div>
            <div className="text-xs text-green-600">↑ 15%</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 flex items-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-4">
            <FaTooth className="text-xl" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Procedure</div>
            <div className="text-xl font-bold text-gray-800">50</div>
            <div className="text-xs text-red-600">↓ 8%</div>
          </div>
        </div>

        {/* UPDATED: This card now shows Today's Appointments */}
        <div className="bg-white rounded-xl shadow p-4 flex items-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4">
            <FaCalendarCheck className="text-xl" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Today's Appointments</div>
            <div className="text-xl font-bold text-gray-800">12</div>
            <div className="text-xs text-green-600">↑ 5% From yesterday</div>
          </div>
        </div>
      </div>

      {/* Appointment Chart + Top Treatments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Appointment Overview</h2>
          <div className="h-56 bg-gray-100 flex items-center justify-center">[Appointment Chart]</div>
          <div className="flex justify-end mt-4 space-x-2">
            <button className="text-sm px-3 py-1 border rounded bg-blue-100">Weekly</button>
            <button className="text-sm px-3 py-1 border rounded bg-blue-500 text-white">Monthly</button>
            <button className="text-sm px-3 py-1 border rounded bg-blue-100">Yearly</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Top Treatments</h2>
          <div className="h-56 bg-gray-100 flex items-center justify-center">[Pie Chart]</div>
          <div className="mt-4 text-sm text-gray-600">
            <ul>
              <li><span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2" /> Root Canal</li>
              <li><span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2" /> Wisdom Tooth</li>
              <li><span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-2" /> Bleaching</li>
              <li><span className="inline-block w-3 h-3 bg-purple-400 rounded-full mr-2" /> Others</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Patient & Approval */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Next Patient Details</h2>
          <div className="flex items-center gap-4">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Patient"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <div className="font-bold">Sophia</div>
              <div className="text-sm text-gray-600">Root Canal Treatment</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
            <div>Patient ID: <span className="font-semibold">124569</span></div>
            <div>Last Visit: <span className="font-semibold">05.12.2024</span></div>
            <div>Gender: Female</div>
            <div>Age: 24</div>
            <div>Height: 155 cm</div>
            <div>Weight: 60 kg</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Approval Requests</h2>
          <div className="space-y-2 text-sm">
            {['Sophia', 'Mason', 'Emily', 'Natalie'].map((name, i) => (
              <div key={i} className="flex justify-between items-center border p-2 rounded">
                <div>
                  <div className="font-semibold">{name}</div>
                  <div className="text-gray-500 text-xs">Root Canal Treatment</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-green-600">✔</button>
                  <button className="text-red-600">✖</button>
                  <button className="text-blue-600">📩</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Today's Appointments</h2>
          <ul className="text-sm space-y-2">
            {['Consultation', 'Scaling', 'Root Canal', 'Open Access'].map((t, i) => (
              <li key={i} className="border p-2 rounded flex justify-between">
                <span>{t}</span><span>09:00–10:00</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-2">Success Stats</h2>
          <div className="text-center text-2xl font-bold text-green-600 mb-2">90%</div>
          <div className="h-24 bg-gray-100 flex items-center justify-center">[Line Graph]</div>
          <p className="text-xs mt-2 text-gray-500">
            Patient success rate is 90%. Monitored by patient satisfaction and surveys.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow space-y-4">
          <div>
            <div className="text-sm text-gray-500">Total Patients This Month</div>
            <div className="text-3xl font-bold">265</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Patients All Time</div>
            <div className="text-3xl font-bold">985</div>
            <button className="mt-1 text-blue-600 text-sm">View More</button>
          </div>
          <div>
            <div className="text-sm text-gray-500">Earnings...</div>
            <div className="text-xl font-bold">$10,150</div>
            <div className="text-xs text-gray-500">Previous Month: $20,000</div>
            <button className="mt-1 text-blue-600 text-sm">View More</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DoctorDashboard;