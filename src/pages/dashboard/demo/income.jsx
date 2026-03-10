// pages/dashboard/admin/income.jsx
import Layout from '../../../components/Layout';
import IncomePage from '../../../components/finance/IncomePage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const Income = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <IncomePage />
    </Layout>
  );
};

export default Income;
