// pages/dashboard/admin/invoice-details.jsx
import Layout from '../../../components/Layout';
import InvoiceDetailsPage from '../../../components/finance/InvoiceDetailsPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const InvoiceDetails = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}>
      <InvoiceDetailsPage />
    </Layout>
  );
};

export default InvoiceDetails;
