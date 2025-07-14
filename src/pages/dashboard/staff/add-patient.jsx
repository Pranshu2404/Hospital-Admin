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
// import ChoosePatientTypeModal from '../../../components/patients/ChoosePatientTypeModal';
import { useNavigate } from 'react-router-dom';
import AddPatientIPDForm from "./AddPatientIPDForm";
import { staffSidebar } from "../../../constants/sidebarItems/staffSidebar";
import ChoosePatientTypeModal from "../../../components/pharmacy/ChoosePatientTypeModal";

const AddPatientPage1 = () => {
  const [open, setOpen] = useState(true); // ✅ This must be a boolean
  const navigate = useNavigate();
  return (
    <Layout sidebarItems={staffSidebar}>
      <ChoosePatientTypeModal isOpen={open} onClose={()=>navigate('/dashboard/staff')} />
      {/* <AddPatientIPDForm/> */}
    </Layout>
  );
};

export default AddPatientPage1;



// import React, { useState } from "react";
// import Layout from '../../../components/Layout';
// import { staffSidebar } from "../../../constants/sidebarItems/staffSidebar";
// import ChoosePatientTypeModal from '../../../components/patients/ChoosePatientTypeModal';
// import { useNavigate } from 'react-router-dom';
// import AddPatientIPDForm from "./AddPatientIPDForm";

// const AddPatientPage = () => {
//   const [open, setOpen] = useState(true); // ✅ This must be a boolean
//   const navigate = useNavigate();
//   return (
//     <Layout sidebarItems={staffSidebar}>
//       <ChoosePatientTypeModal isOpen={open} onClose={()=>navigate('/dashboard/staff')} />
//       {/* <AddPatientIPDForm/> */}
//     </Layout>
//   );
// };

// export default AddPatientPage;
