import Layout from '../../../components/Layout';
import AppointmentList from '../../../components/appointments/AppointmentList';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const AppointmentsPage = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <AppointmentList />
    </Layout>
  );
};

export default AppointmentsPage;
