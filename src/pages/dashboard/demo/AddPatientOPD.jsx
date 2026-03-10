import React, { useState } from "react";
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddPatientOPDForm from './AddPatientOPDForm';
import { demoSidebar } from "@/constants/sidebarItems/demoSidebar";


const AddPatientOPD = () => {
  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      <AddPatientOPDForm />
    </Layout>
  );
};

export default AddPatientOPD;