// pages/dashboard/admin/expense.jsx
import Layout from '../../../components/Layout';
import ExpensePage from '../../../components/finance/ExpensePage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const Expense = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <ExpensePage />
    </Layout>
  );
};

export default Expense;
