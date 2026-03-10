// import Layout from '../../../components/Layout';
// import ChoosePatientTypeModal from '../../../components/patients/ChoosePatientTypeModal';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// const AddPatientPage = () => {
//   return (
//     <Layout sidebarItems={adminSidebar}>
//       <ChoosePatientTypeModal />
//     </Layout>
//   );
// };

// export default AddPatientPage;



import React, { useState } from "react";
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import ChoosePatientTypeModal from '../../../components/patients/ChoosePatientTypeModal';
import { useNavigate } from 'react-router-dom';
import AddPatientIPDForm from "./AddPatientIPDForm";
import { demoSidebar } from "@/constants/sidebarItems/demoSidebar";

const AddPatientPage = () => {
  const [open, setOpen] = useState(true); // ✅ This must be a boolean
  const navigate = useNavigate();
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      {/* <ChoosePatientTypeModal isOpen={open} onClose={()=>navigate('/dashboard/admin')} /> */}
      <AddPatientIPDForm/>
    </Layout>
  );
};

export default AddPatientPage;
