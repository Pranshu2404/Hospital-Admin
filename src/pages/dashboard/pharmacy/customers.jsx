import { useState } from 'react';
import Layout from '../../../components/Layout';
import CustomerList from '../../../components/customer/CustomerList';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const CustomersPage = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState('CustomerList');

  return (
    <Layout sidebarItems={pharmacySidebar}>
      <CustomerList/>
    </Layout>
  );
};

export default CustomersPage;
