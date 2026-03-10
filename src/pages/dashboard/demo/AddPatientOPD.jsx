import React, { useState } from "react";
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddPatientOPDForm from './AddPatientOPDForm';


const AddPatientOPD = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <AddPatientOPDForm />
    </Layout>
  );
};

export default AddPatientOPD;