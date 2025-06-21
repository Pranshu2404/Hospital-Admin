import { useState } from 'react';
import Layout from '../../../components/Layout';
import MedicineList from '../../../components/pharmacy/MedicineList';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const MedicineListPage = () => {
  const [currentPage, setCurrentPage] = useState('MedicineList');

  return (
    <Layout sidebarItems={pharmacySidebar}>
      <MedicineList />
    </Layout>
  );
};

export default MedicineListPage;
