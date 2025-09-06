import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import CreatePurchaseOrder from '@/components/pharmacy/PurchaseOrder';

const CreateOrder = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <CreatePurchaseOrder />
    </Layout>
  );
};

export default CreateOrder;
