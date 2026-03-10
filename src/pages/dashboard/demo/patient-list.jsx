import { useState } from 'react';
import Layout from '../../../components/Layout';
import IpdOpdPatientList from '../../../components/patients/IpdOpdPatientList';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const PatientListPage = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <IpdOpdPatientList setSelectedPatient={setSelectedPatient} />
    </Layout>
  );
};

export default PatientListPage;
