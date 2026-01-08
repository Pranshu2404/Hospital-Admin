// import React from 'react'
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar'
import Layout from '../../../components/Layout'
import AddPatientForm from '../../../components/patients/AddPatientForm'

function Admission() {
  return (
    <Layout sidebarItems={staffSidebar} section={'Staff'} resetProgress={() => {}}>
      <h1 className="text-2xl font-bold mb-4">Patient Admission</h1>
      <AddPatientForm />
    </Layout>
  )
}

export default Admission
