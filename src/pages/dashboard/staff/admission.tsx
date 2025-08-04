// import React from 'react'
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar'
import Layout from '../../../components/Layout'
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




// import React, { useState } from 'react'
// import Layout from '../../../components/Layout'
// import { staffSidebar } from '../../../constants/sidebarItems/staffSidebar'
// import ChoosePatientTypeModal from '../../../components/patients/ChoosePatientTypeModal'

// function Admission() {
//   const [isOpen, setIsOpen] = useState(true); // or false if you want to trigger via button

//   return (
//     <Layout sidebarItems={staffSidebar} section="Staff">
//       <h1 className="text-2xl font-bold mb-4">Patient Admission</h1>
//       <ChoosePatientTypeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
//     </Layout>
//   )
// }

// export default Admission
