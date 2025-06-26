import React, { useState } from "react";
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddPatientOPDForm from './AddPatientOPDForm';
import { staffSidebar } from "../../../constants/sidebarItems/staffSidebar";


const AddPatientOPD1 = () => {
  return (
    <Layout sidebarItems={staffSidebar}>
      <AddPatientOPDForm />
    </Layout>
  );
};

export default AddPatientOPD1;