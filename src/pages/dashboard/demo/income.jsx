// pages/dashboard/admin/income.jsx
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import Layout from '../../../components/Layout';
import IncomePage from '../../../components/finance/IncomePage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const Income = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <IncomePage />
    </Layout>
  );
};

export default Income;
