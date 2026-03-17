import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import AppointmentList from '../../../components/appointments/AppointmentList';
import AddAppointmentModal from '../../../components/appointments/AddAppointmentModal';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { Button } from '../../../components/common/FormElements';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const AppointmentsPage = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <AppointmentList />
    </Layout>
  );
};

export default AppointmentsPage;
          