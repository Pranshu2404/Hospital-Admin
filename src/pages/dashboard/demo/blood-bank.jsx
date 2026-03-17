// pages/dashboard/admin/blood-bank.jsx
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import Layout from '../../../components/Layout';
import BloodBankPage from '../../../components/reports/BloodBankPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const BloodBank = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <BloodBankPage />
    </Layout>
  );
};

export default BloodBank;
