import React, { useState } from "react";
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddPatientIPDForm from './AddPatientIPDForm';


const AddPatientIPD = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <AddPatientIPDForm />
    </Layout>
  );
};

export default AddPatientIPD;