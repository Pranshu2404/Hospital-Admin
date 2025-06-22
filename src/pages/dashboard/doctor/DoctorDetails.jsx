import React, { useState } from 'react';
import EditProfileModal from './EditProfileModal';

const DoctorDetails = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <main className="flex-1  min-h-screen ">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-center gap-6">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Dr. Emily Stone"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-semibold">Dr. Emily Stone</h1>
          <p className="text-gray-500">Cardiologist</p>
          <p className="text-gray-500">ID: #DR0456</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setShowModal(true)}
          >
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded">Deactivate</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[
          { title: 'Patients This Month', value: 45 },
          { title: 'Total Appointments', value: 128 },
          { title: 'Consultations', value: 80 },
          { title: 'Procedures', value: 42 },
        ].map((card, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow">
            <div className="text-sm text-gray-500">{card.title}</div>
            <div className="mt-1 text-2xl font-bold">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Contact & Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white p-6 rounded-xl shadow space-y-2">
          <h2 className="font-semibold">Contact Information</h2>
          <p>Email: emily.stone@clinic.com</p>
          <p>Phone: (+1) 234‑567‑8901</p>
          <p>Location: 123 Medical Ave, Health City</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow space-y-2">
          <h2 className="font-semibold">Weekly Schedule</h2>
          <ul className="space-y-1">
            {['Mon – Fri: 9 AM – 5 PM', 'Sat: 10 AM – 2 PM', 'Sun: Off'].map((line, i) => (
              <li key={i} className="text-gray-600">{line}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Activity & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Recent Appointments</h2>
          <ul className="divide-y">
            {[
              { patient: 'Akiko', date: 'Jun 20, 2025 – 10:00 AM' },
              { patient: 'Ashton Cox', date: 'Jun 19, 2025 – 02:00 PM' },
              { patient: 'Cedric Kelly', date: 'Jun 18, 2025 – 11:00 AM' },
            ].map((appt, i) => (
              <li key={i} className="py-2 flex justify-between">
                <span>{appt.patient}</span>
                <span className="text-gray-500">{appt.date}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Activity Log</h2>
          <ul className="text-gray-600 space-y-2 text-sm">
            <li>Updated profile information</li>
            <li>Added procedure notes for Dr. Stone</li>
            <li>Checked in new patient records</li>
          </ul>
        </div>
      </div>

      {showModal && <EditProfileModal onClose={() => setShowModal(false)} />}
    </main>
  );
};

export default DoctorDetails;
