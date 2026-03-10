import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import StaffList from '../../../components/staff/StaffList';

const StaffListPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={adminSidebar}>
      <StaffList/>
    </Layout>
  );
};

export default StaffListPage;
