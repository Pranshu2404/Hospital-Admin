import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import PatientProfile from '../../../components/patients/PatientProfile/PatientProfile';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import StaffProfile from '../../../components/staff/StaffProfile';

const StaffProfilePage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={adminSidebar}>
      <StaffProfile/>
    </Layout>
  );
};

export default StaffProfilePage;
