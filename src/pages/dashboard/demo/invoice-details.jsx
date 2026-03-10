// pages/dashboard/admin/invoice-details.jsx
import Layout from '../../../components/Layout';
import InvoiceDetailsPage from '../../../components/finance/InvoiceDetailsPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const InvoiceDetails = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <InvoiceDetailsPage />
    </Layout>
  );
};

export default InvoiceDetails;
