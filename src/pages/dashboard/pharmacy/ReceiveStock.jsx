import ReceiveStock from '@/components/pharmacy/ReceiveStock';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const ReceiveStockPage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar} section="Pharmacy">
      <ReceiveStock />
    </Layout>
  );
};

export default ReceiveStockPage;
