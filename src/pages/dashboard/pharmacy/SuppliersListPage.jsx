import Layout from '../../../components/Layout';
import SupplierPage from './SupplierPage';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const InvoiceDetails = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <SupplierPage />
    </Layout>
  );
};

export default InvoiceDetails;