
import React from 'react';
import SidebarDoctor from '../../../components/SidebarDoctor';
import AppointmentChart from './AppointmentTable'; // assuming you renamed the file

const AppointmentPage = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <SidebarDoctor />

      {/* Main content */}
      <main className="flex-1 bg-gray-100 min-h-screen overflow-y-auto ">
        <AppointmentChart />
      </main>
    </div>
  );
};

export default AppointmentPage;
