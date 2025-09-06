import { useState } from 'react';
import Layout from '../../../components/Layout';
import CustomerProfile from '../../../components/customer/CustomerProfile';
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar';

const CustomerProfilePage = () => {

  return (
    <Layout sidebarItems={pharmacySidebar}section="Pharmacy">
      <CustomerProfile/>
    </Layout>
  );
};

export default CustomerProfilePage;
