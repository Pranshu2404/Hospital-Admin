import React, { useState } from "react";
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import AddPatientIPDForm from '../admin/AddPatientIPDForm';
import { staffSidebar } from "../../../constants/sidebarItems/staffSidebar";


const AddPatientIPD1 = () => {
  return (
    <Layout sidebarItems={staffSidebar}>
      <AddPatientIPDForm />
    </Layout>
  );
};

export default AddPatientIPD1;