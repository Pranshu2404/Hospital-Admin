import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import PatientProfile from '../../../components/patients/PatientProfile/PatientProfile';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddStaffForm from '../../../components/staff/AddStaffForm';
import AddRegistrarForm from '../../../components/staff/AddRegistrarForm';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const AddRegistrarPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <AddRegistrarForm/>
    </Layout>
  );
};

export default AddRegistrarPage;
