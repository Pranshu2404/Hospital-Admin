import NewPrescription from '@/components/pharmacy/NewPrescription';
import Layout from '../../../components/Layout';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';
import PurchaseOrdersList from '@/components/pharmacy/PurchaseOrdersList';

const NewPrescriptionPage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <NewPrescription />
    </Layout>
  );
};

export default NewPrescriptionPage;
