// pages/dashboard/admin/blood-bank.jsx
import Layout from '../../../components/Layout';
import BloodBankPage from '../../../components/reports/BloodBankPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const BloodBank = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <BloodBankPage />
    </Layout>
  );
};

export default BloodBank;
