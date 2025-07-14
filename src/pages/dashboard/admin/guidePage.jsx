

import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
// import PatientProfile from '../../../components/patients/PatientProfile/PatientProfile';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import Guidecontent from './guidecontent';

const GuidePage = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <Guidecontent />
    </Layout>
  );
};

export default GuidePage;