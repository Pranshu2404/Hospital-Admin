import React from 'react';
import { doctorSidebar } from '../../../constants/sidebarItems/doctorSidebar';
import Layout from '../../../components/Layout';
import SchedulePage from './SchedulePage'; // adjust if path is different

const DoctorDashboardPage = () => {
  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <SchedulePage/>
    </Layout>
  );
};

export default DoctorDashboardPage;