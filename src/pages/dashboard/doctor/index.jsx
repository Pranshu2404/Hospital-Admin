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