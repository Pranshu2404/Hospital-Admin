import Layout from '../../../components/Layout';
import Dashboard from '../../../components/dashboard/Dashboard';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const AdminHome = () => {
  return (
    <Layout sidebarItems={adminSidebar} section="admin">
      <Dashboard />
    </Layout>
  );
};

export default AdminHome;
