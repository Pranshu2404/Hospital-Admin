import Layout from '../../../components/Layout';
import AddMedicine from '../../../components/pharmacy/AddMedicine';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const AddMedicinePage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}>
      <AddMedicine />
    </Layout>
  );
};

export default AddMedicinePage;
