// pages/dashboard/admin/birth-report.jsx
import Layout from '../../../components/Layout';
import BirthReportPage from '../../../components/reports/BirthReportPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const BirthReport = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <BirthReportPage />
    </Layout>
  );
};

export default BirthReport;
