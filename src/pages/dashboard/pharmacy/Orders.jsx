import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import PurchaseOrdersList from '@/components/pharmacy/PurchaseOrdersList';

const Orders = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <PurchaseOrdersList />
    </Layout>
  );
};

export default Orders;
