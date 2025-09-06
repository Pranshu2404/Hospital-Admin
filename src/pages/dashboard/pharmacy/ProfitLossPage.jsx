import ProfitLossReport from '@/components/pharmacy/ProfitLossReport';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import PurchaseOrdersList from '@/components/pharmacy/PurchaseOrdersList';

const ProfitLossPage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <ProfitLossReport />
    </Layout>
  );
};

export default ProfitLossPage;
