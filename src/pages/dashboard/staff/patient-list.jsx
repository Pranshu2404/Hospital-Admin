import { useState } from 'react';
import Layout from '../../../components/Layout';
import IpdOpdPatientList from '../../../components/patients/IpdOpdPatientList';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar'

const PatientListPage1 = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <Layout sidebarItems={staffSidebar} section={'Staff'}>
        <IpdOpdPatientList setSelectedPatient={setSelectedPatient} updatePatientBasePath="/dashboard/staff/update-patient" />
    </Layout>
  );
};

export default PatientListPage1;
