import Layout from '../../../components/Layout';
import AppointmentList from '../../../components/pharmacy/AppointmentList';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { staffSidebar } from '../../../constants/sidebarItems/staffSidebar';

const AppointmentsPage1 = () => {
  return (
    <Layout sidebarItems={staffSidebar}>
      <AppointmentList />
    </Layout>
  );
};

export default AppointmentsPage1;
