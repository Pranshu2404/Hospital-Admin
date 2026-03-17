// pages/dashboard/admin/inventory.jsx
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';
import Layout from '../../../components/Layout';
import InventoryItemsPage from '../../../components/reports/InventoryItemsPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const Inventory = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <InventoryItemsPage />
    </Layout>
  );
};

export default Inventory;
