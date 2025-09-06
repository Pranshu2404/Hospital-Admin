import PointOfSale from '@/components/pharmacy/PointOfSale';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const POSPage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <PointOfSale/>
    </Layout>
  );
};

export default POSPage;
