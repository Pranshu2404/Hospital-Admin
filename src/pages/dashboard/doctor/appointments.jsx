import React from 'react';
import { doctorSidebar } from '../../../constants/sidebarItems/doctorSidebar';
import Layout from '../../../components/Layout';
import DoctorAppointments from './AppointmentTable';

const AppointmentPage = () => {
  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <DoctorAppointments />
    </Layout>
  );
};

export default AppointmentPage;
