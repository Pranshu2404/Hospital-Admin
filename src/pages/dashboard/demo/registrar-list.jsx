import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import StaffList from '../../../components/staff/StaffList';
import RegistrarList from '../../../components/staff/RegistrarList';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const RegistrarListPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <RegistrarList/>
    </Layout>
  );
};

export default RegistrarListPage;
