import Layout from '../../../components/Layout';
import MedicineDetail from '../../../components/pharmacy/MedicineDetail';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const MedicineDetailPage = () => {
  return (
    <Layout sidebarItems={pharmacySidebar}>
      <MedicineDetail />
    </Layout>
  );
};

export default MedicineDetailPage;
