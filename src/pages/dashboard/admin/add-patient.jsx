import Layout from '../../../components/Layout';
import AddPatientForm from '../../../components/patients/AddPatientForm';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const AddPatientPage = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <AddPatientForm />
    </Layout>
  );
};

export default AddPatientPage;
