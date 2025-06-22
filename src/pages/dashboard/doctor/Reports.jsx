
import React from 'react';
import { doctorSidebar } from '../../../constants/sidebarItems/doctorSidebar';
import Layout from '../../../components/Layout';
import ReportsPage from './ReportsPage'; // adjust if path is different

const DoctorDashboardPage = () => {
  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <ReportsPage />
    </Layout>
  );
};

export default DoctorDashboardPage;