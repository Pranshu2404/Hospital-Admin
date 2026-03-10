// pages/dashboard/admin/expense.jsx
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import Layout from '../../../components/Layout';
import ExpensePage from '../../../components/finance/ExpensePage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const Expense = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <ExpensePage />
    </Layout>
  );
};

export default Expense;
