import { useState } from 'react';
import Layout from '../../../components/Layout';
import CustomerProfile from '../../../components/customer/CustomerProfile';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const CustomerProfilePage = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState('CustomerProfile');

  return (
    <Layout sidebarItems={pharmacySidebar}>
      <CustomerProfile/>
    </Layout>
  );
};

export default CustomerProfilePage;
