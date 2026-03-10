import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import DoctorNurseList from '../../../components/doctor/DoctorNurseList';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import DemoDoctorNurseList from '@/components/doctor/DemoDoctorNurseList';

const DoctorListPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <DemoDoctorNurseList/>
    </Layout>
  );
};

export default DoctorListPage;
