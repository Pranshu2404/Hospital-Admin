import React from 'react';
import { doctorSidebar } from '../../../constants/sidebarItems/doctorSidebar';
import Layout from '../../../components/Layout';
import DoctorDetails from './DoctorDetails'; // adjust if path is different

const Details = () => {
  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <DoctorDetails />
    </Layout>
  );
};

export default Details;
