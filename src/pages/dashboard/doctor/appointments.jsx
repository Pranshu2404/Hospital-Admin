import React from 'react';
import { doctorSidebar } from '../../../constants/sidebarItems/doctorSidebar';
import Layout from '../../../components/Layout';
import AppointmentChart from './AppointmentTable'; // Ensure this name matches the actual file/component

const AppointmentPage = () => {
  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <AppointmentChart />
    </Layout>
  );
};

export default AppointmentPage;
