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


const AddPatient = () => {
  const [open, setOpen] = useState(true); // ✅ This must be a boolean

  return (
    <div>
      <ChoosePatientTypeModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default AddPatient;
