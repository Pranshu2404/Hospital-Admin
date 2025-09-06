import BatchManagement from '@/components/pharmacy/BatchManagement';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import ExpiredMedicines from '@/components/pharmacy/ExpiredMedicines';

const Expired = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <ExpiredMedicines />
    </Layout>
  );
};

export default Expired;
