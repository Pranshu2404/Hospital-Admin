import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddDoctorNurseForm from '../../../components/doctor/AddDoctorNurseForm';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const AddDoctorPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <AddDoctorNurseForm/>
    </Layout>
  );
};

export default AddDoctorPage;
