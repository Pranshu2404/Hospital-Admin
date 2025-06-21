// pages/dashboard/admin/expense.jsx
import Layout from '../../../components/Layout';
import ExpensePage from '../../../components/finance/ExpensePage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const Expense = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}>
      <ExpensePage />
    </Layout>
  );
};

export default Expense;
