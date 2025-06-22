import React from 'react'
import Layout from '../../../components/Layout'
import { staffSidebar } from '../../../constants/sidebarItems/staffSidebar'
import AddPatientForm from '../../../components/patients/AddPatientForm'

function Admission() {
  return (
    <Layout sidebarItems={staffSidebar} section="Staff">
      <h1 className="text-2xl font-bold mb-4">Patient Admission</h1>
      <AddPatientForm />
    </Layout>
  )
}

export default Admission