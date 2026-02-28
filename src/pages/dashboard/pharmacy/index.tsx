
import Layout from '../../../components/Layout';
import PharmacyDashboard from './PharmacyDashboard';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const Inventory = () => {
  return (
    <Layout sidebarItems={pharmacySidebar} section="Pharmacy" resetProgress={()=>{}}>
      <PharmacyDashboard />
    </Layout>
  );
};

export default Inventory;
