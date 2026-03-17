// pages/dashboard/admin/invoice-details.jsx
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import Layout from '../../../components/Layout';
import InvoiceDetailsPage from '../../../components/finance/InvoiceDetailsPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const InvoiceDetails = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <InvoiceDetailsPage />
    </Layout>
  );
};

export default InvoiceDetails;
