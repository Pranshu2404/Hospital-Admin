import BatchManagement from '@/components/pharmacy/BatchManagement';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import LowStockList from '@/components/pharmacy/LowStockList';
import LowStockAlert from '@/components/pharmacy/LowStockAlert';

const LowStock = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <LowStockAlert />
    </Layout>
  );
};

export default LowStock;
