import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import DemoStaffList from '@/components/staff/DemoStaffList';

const StaffListPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <DemoStaffList/>
    </Layout>
  );
};

export default StaffListPage;
