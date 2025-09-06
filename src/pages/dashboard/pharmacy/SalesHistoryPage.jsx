import SalesHistory from '@/components/pharmacy/SalesHistory';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const SalesHistoryPage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <SalesHistory/>
    </Layout>
  );
};

export default SalesHistoryPage;
