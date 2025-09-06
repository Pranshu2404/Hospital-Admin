import BatchManagement from '@/components/pharmacy/BatchManagement';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import ExpiredMedicines from '@/components/pharmacy/ExpiredMedicines';
import DispenseMedication from '@/components/pharmacy/DispenseMedication';

const DispensePage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <DispenseMedication />
    </Layout>
  );
};

export default DispensePage;
