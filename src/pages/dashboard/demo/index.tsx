import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import Layout from '../../../components/Layout';
import Dashboard from '../../../components/dashboard/Dashboard';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const AdminHome = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User" resetProgress={()=>{}}>
      <Dashboard />
    </Layout>
  );
};

export default AdminHome;
