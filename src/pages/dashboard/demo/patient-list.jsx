import { useState } from 'react';
import Layout from '../../../components/Layout';
import IpdOpdPatientList from '../../../components/patients/IpdOpdPatientList';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const PatientListPage = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <Layout sidebarItems={adminSidebar}>
      <IpdOpdPatientList setSelectedPatient={setSelectedPatient} />
    </Layout>
  );
};

export default PatientListPage;
