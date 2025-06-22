import Layout from '../../../components/Layout';
import AddCustomerForm from '../../../components/customer/AddCustomerForm';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const AddCustomerPage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <AddCustomerForm />
    </Layout>
  );
};

export default AddCustomerPage;
