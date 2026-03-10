import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import PatientProfile from '../../../components/patients/PatientProfile/PatientProfile';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddStaffForm from '../../../components/staff/AddStaffForm';
import AddRegistrarForm from '../../../components/staff/AddRegistrarForm';

const AddRegistrarPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={adminSidebar}>
      <AddRegistrarForm/>
    </Layout>
  );
};

export default AddRegistrarPage;
