import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import PatientProfile from '../../../components/patients/PatientProfile/PatientProfile';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import StaffProfile from '../../../components/staff/StaffProfile';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const StaffProfilePage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <StaffProfile/>
    </Layout>
  );
};

export default StaffProfilePage;
