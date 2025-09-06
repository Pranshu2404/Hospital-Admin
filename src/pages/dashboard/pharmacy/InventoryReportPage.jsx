import InventoryReports from '@/components/pharmacy/InventoryReports';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import PurchaseOrdersList from '@/components/pharmacy/PurchaseOrdersList';

const InventoryReportPage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <InventoryReports />
    </Layout>
  );
};

export default InventoryReportPage;
