import React from 'react';
import { doctorSidebar } from '../../../constants/sidebarItems/doctorSidebar';
import Layout from '../../../components/Layout';
import AppointmentChart from './AppointmentTable'; // assuming you renamed the file

const AppointmentPage = () => {
  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <AppointmentChart />
    </Layout>
  );
};

export default AppointmentPage;
