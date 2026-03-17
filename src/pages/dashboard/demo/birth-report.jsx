// pages/dashboard/admin/birth-report.jsx
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import Layout from '../../../components/Layout';
import BirthReportPage from '../../../components/reports/BirthReportPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const BirthReport = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <BirthReportPage />
    </Layout>
  );
};

export default BirthReport;
