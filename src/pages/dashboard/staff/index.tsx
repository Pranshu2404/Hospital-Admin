import React from 'react'
import Layout from '../../../components/Layout'
import { staffSidebar } from '../../../constants/sidebarItems/staffSidebar'

function StaffDashboard() {
  return (
    <Layout sidebarItems={staffSidebar}>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Staff Dashboard</h1>
        <p className="text-lg">Welcome to the Staff Dashboard!</p>
        <p className="text-sm text-gray-500">Manage your staff operations here.</p>
      </div>
    </Layout>
  )
}

export default StaffDashboard