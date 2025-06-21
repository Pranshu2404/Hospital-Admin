import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import DoctorNurseList from '../../../components/doctor/DoctorNurseList';

const DoctorListPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={adminSidebar}>
      <DoctorNurseList/>
    </Layout>
  );
};

export default DoctorListPage;
