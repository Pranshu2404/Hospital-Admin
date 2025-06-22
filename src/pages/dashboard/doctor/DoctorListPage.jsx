import React from 'react';

const doctors = [
  {
    initials: 'DSW',
    name: 'Dr. Sarah Wilson',
    license: 'MD12345',
    department: 'General Medicine',
    role: 'Doctor',
    contact: '+1 234-567-8900',
    email: 'sarah.wilson@hospital.com',
    experience: '8 years',
    shift: 'Morning',
    status: 'Active',
  },
  {
    initials: 'DMC',
    name: 'Dr. Michael Chen',
    license: 'MD23456',
    department: 'Cardiology',
    role: 'Doctor',
    contact: '+1 234-567-8901',
    email: 'michael.chen@hospital.com',
    experience: '12 years',
    shift: 'Evening',
    status: 'Active',
  },
  {
    initials: 'DLA',
    name: 'Dr. Lisa Anderson',
    license: 'MD45678',
    department: 'Orthopedics',
    role: 'Doctor',
    contact: '+1 234-567-8903',
    email: 'lisa.anderson@hospital.com',
    experience: '10 years',
    shift: 'Morning',
    status: 'On Leave',
  },
];

const shiftColor = {
  Morning: 'bg-orange-100 text-orange-600',
  Evening: 'bg-indigo-100 text-indigo-600',
  Night: 'bg-gray-200 text-gray-600',
  Rotating: 'bg-purple-100 text-purple-600',
};

const statusColor = {
  Active: 'bg-green-100 text-green-600',
  'On Leave': 'bg-yellow-100 text-yellow-600',
  Inactive: 'bg-red-100 text-red-600',
};

const DoctorListPage = () => {
  return (
    <main className="p-6 min-h-screen">
      <div className="bg-white rounded-xl p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Doctors List</h1>
        <p className="text-sm text-gray-500 mb-4">Manage doctors and medical staff</p>

        <div className="mb-4 flex items-center justify-between">
          <input
            type="text"
            placeholder="Search by name, specialization, or department..."
            className="border rounded px-3 py-2 w-full max-w-md text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role & Department</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 flex items-center gap-3">
                    <div className="bg-teal-100 text-teal-700 font-bold w-10 h-10 rounded-full flex items-center justify-center">
                      {doc.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{doc.name}</div>
                      <div className="text-gray-500 text-xs">License: {doc.license}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-xs font-medium mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                        {doc.role}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{doc.department}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    <div>{doc.contact}</div>
                    <div className="text-gray-500 text-xs">{doc.email}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{doc.experience}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${shiftColor[doc.shift]}`}
                    >
                      {doc.shift}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${statusColor[doc.status]}`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-blue-600 flex items-center gap-3">
                    <button className="hover:underline text-sm">View</button>
                    <button title="Edit" className="text-gray-500 hover:text-blue-600">
                      ✏️
                    </button>
                    <button title="Delete" className="text-red-500 hover:text-red-700">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default DoctorListPage;
