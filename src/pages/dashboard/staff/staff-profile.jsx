import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';;
import { staffSidebar } from '../../../constants/sidebarItems/staffSidebar';
import StaffProfile from '../../../components/staff/StaffProfile';

const StaffProfilePage1 = () => {
  // const location = useLocation();
  // const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <StaffProfile/>
    </Layout>
  );
};

export default StaffProfilePage1;
