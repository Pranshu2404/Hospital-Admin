import Layout from '../../../components/Layout';
import AddCustomerForm from '../../../components/customer/AddCustomerForm';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const AddCustomerPage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}>
      <AddCustomerForm />
    </Layout>
  );
};

export default AddCustomerPage;
