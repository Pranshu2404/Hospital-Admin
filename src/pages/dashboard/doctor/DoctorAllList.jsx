import { useLocation } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { doctorSidebar } from '../../../constants/sidebarItems/doctorSidebar';
import DoctorList from './DoctorListPage'; 

const DoctorAllList = () => {
  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <DoctorList />
    </Layout>
  );
};

export default DoctorAllList;