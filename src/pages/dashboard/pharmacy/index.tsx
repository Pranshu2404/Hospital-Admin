import React from 'react'
import Layout from '../../../components/Layout'
import { pharmacySidebar } from '../../../constants/sidebarItems/pharmacySidebar'

function PharmacyDashboard() {
  return (
    <Layout sidebarItems={pharmacySidebar} section="Pharmacy">
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Pharmacy Dashboard</h1>
        <p className="text-lg">Welcome to the Pharmacy Dashboard!</p>
        <p className="text-sm text-gray-500">Manage your pharmacy operations here.</p>
      </div>
    </Layout>
  )
}

export default PharmacyDashboard