// pages/dashboard/admin/inventory.jsx
import Layout from '../../../components/Layout';
import InventoryItemsPage from '../../../components/reports/InventoryItemsPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const Inventory = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <InventoryItemsPage />
    </Layout>
  );
};

export default Inventory;
