import BatchManagement from '@/components/pharmacy/BatchManagement';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const BatchPage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <BatchManagement />
    </Layout>
  );
};

export default BatchPage;
