import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddDoctorNurseForm from '../../../components/doctor/AddDoctorNurseForm';

const AddDoctorPage = () => {
  const location = useLocation();
  const patient = location.state?.patient || null;

  return (
    <Layout sidebarItems={adminSidebar}>
      <AddDoctorNurseForm/>
    </Layout>
  );
};

export default AddDoctorPage;
