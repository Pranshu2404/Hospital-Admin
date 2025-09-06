import { useState } from 'react';
import Layout from '../../../components/Layout';
import CustomerList from '../../../components/customer/CustomerList';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const CustomersPage = () => {

  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <CustomerList/>
    </Layout>
  );
};

export default CustomersPage;
