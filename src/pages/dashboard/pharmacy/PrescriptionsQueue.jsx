import PointOfSale from '@/components/pharmacy/PointOfSale';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import PrescriptionQueue from '@/components/pharmacy/PrescriptionQueue';
import AllPrescriptions from '@/components/pharmacy/AllPrescriptions';

const PrescriptionsQueue = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <PrescriptionQueue/>
    </Layout>
  );
};

export default PrescriptionsQueue;
