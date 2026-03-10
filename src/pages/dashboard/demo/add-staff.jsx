import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import PatientProfile from '../../../components/patients/PatientProfile/PatientProfile';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddStaffForm from '../../../components/staff/AddStaffForm';

const AddStaffPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={adminSidebar}>
      <AddStaffForm/>
    </Layout>
  );
};

export default AddStaffPage;
