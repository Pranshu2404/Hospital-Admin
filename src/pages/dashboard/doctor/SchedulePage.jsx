import React from 'react';

const weeklySchedule = [
  { day: 'Monday', time: '9:00 AM – 5:00 PM' },
  { day: 'Tuesday', time: '9:00 AM – 5:00 PM' },
  { day: 'Wednesday', time: '9:00 AM – 5:00 PM' },
  { day: 'Thursday', time: '9:00 AM – 5:00 PM' },
  { day: 'Friday', time: '9:00 AM – 5:00 PM' },
  { day: 'Saturday', time: '10:00 AM – 2:00 PM' },
  { day: 'Sunday', time: 'Off' },
];

const upcomingAppointments = [
  { patient: 'John Doe', date: '2025-06-23', time: '10:00 AM' },
  { patient: 'Jane Smith', date: '2025-06-23', time: '11:30 AM' },
  { patient: 'Alice Brown', date: '2025-06-24', time: '09:00 AM' },
];

const SchedulePage = () => {
  return (
    <main className="flex-1 min-h-screen  px-6 py-8">
      <h1 className="text-2xl font-bold mt-0 mb-6 bg-white p-4">Doctor Schedule</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Schedule */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Weekly Availability</h2>
          <ul className="space-y-2">
            {weeklySchedule.map((item, i) => (
              <li key={i} className="flex justify-between text-gray-700">
                <span>{item.day}</span>
                <span>{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          <ul className="divide-y">
            {upcomingAppointments.map((appt, i) => (
              <li key={i} className="py-2 flex justify-between text-gray-700">
                <div>
                  <p className="font-medium">{appt.patient}</p>
                  <p className="text-sm text-gray-500">{appt.date}</p>
                </div>
                <span>{appt.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
};

export default SchedulePage;
