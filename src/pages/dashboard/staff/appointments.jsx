import AppointmentListStaff from '@/components/appointments/AppointmentListStaff';
import Layout from '../../../components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar'

const AppointmentsPage1 = () => {
  return (
    <Layout sidebarItems={staffSidebar} section={'Staff'}>
      <AppointmentListStaff />
    </Layout>
  );
};

export default AppointmentsPage1;
