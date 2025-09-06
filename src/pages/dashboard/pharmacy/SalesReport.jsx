import SalesReports from '@/components/pharmacy/SalesReport';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import PurchaseOrdersList from '@/components/pharmacy/PurchaseOrdersList';

const SalesReport = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <SalesReports />
    </Layout>
  );
};

export default SalesReport;
