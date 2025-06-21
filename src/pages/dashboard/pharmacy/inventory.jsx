// pages/dashboard/admin/inventory.jsx
import Layout from '../../../components/Layout';
import InventoryItemsPage from '../../../components/reports/InventoryItemsPage';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const Inventory = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}>
      <InventoryItemsPage />
    </Layout>
  );
};

export default Inventory;
