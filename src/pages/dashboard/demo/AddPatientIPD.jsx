import React, { useState } from "react";
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddPatientIPDForm from './AddPatientIPDForm';
import { demoSidebar } from "@/constants/sidebarItems/demoSidebar";


const AddPatientIPD = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <AddPatientIPDForm />
    </Layout>
  );
};

export default AddPatientIPD;