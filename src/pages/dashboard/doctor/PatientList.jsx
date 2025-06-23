import React from 'react';
import { doctorSidebar } from '../../../constants/sidebarItems/doctorSidebar';
import Layout from '../../../components/Layout';
import PatientListPage from './PatientListPage'; // adjust if path is different

const PatientList = () => {
  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <PatientListPage />
    </Layout>
  );
};

export default PatientList;