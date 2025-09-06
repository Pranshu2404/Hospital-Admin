import BatchManagement from '@/components/pharmacy/BatchManagement';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import StockAdjustments from '@/components/pharmacy/StockAdjustments';

const Adjustments = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <StockAdjustments />
    </Layout>
  );
};

export default Adjustments;
