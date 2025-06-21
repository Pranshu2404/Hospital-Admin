// import { useState } from 'react';
// import Layout from '../../../components/Layout';
// import Dashboard from '../../../components/dashboard/Dashboard';
// import AppointmentList from '../../../components/appointments/AppointmentList';
// import AddPatientForm from '../../../components/patients/AddPatientForm';
// import IpdOpdPatientList from '../../../components/patients/IpdOpdPatientList';
// import PatientProfile from '../../../components/patients/PatientProfile/PatientProfile';
// import AddDoctorNurseForm from '../../../components/doctor/AddDoctorNurseForm';
// import DoctorNurseList from '../../../components/doctor/DoctorNurseList';
// import IncomePage from '../../../components/finance/IncomePage';
// import ExpensePage from '../../../components/finance/ExpensePage';
// import InvoiceListPage from '../../../components/finance/InvoiceListPage';
// import InvoiceDetailsPage from '../../../components/finance/InvoiceDetailsPage';
// import InventoryItemsPage from '../../../components/reports/InventoryItemsPage';
// import BirthReportPage from '../../../components/reports/BirthReportPage';
// import BloodBankPage from '../../../components/reports/BloodBankPage';
// import UserProfilePage from '../../../components/user/UserProfilePage';
// import SettingsPage from '../../../components/settings/SettingsPage';
// import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

// const AdminDashboard = () => {
//   const [currentPage, setCurrentPage] = useState('Dashboard');
//   const [selectedPatient, setSelectedPatient] = useState(null);
//   const [selectedInvoice, setSelectedInvoice] = useState(null);

//   const renderCurrentPage = () => {
//     switch (currentPage) {
//       case 'Dashboard':
//         return <Dashboard />;
//       case 'AppointmentList':
//         return <AppointmentList />;
//       case 'AddPatient':
//         return <AddPatientForm />;
//       case 'IpdOpdPatientList':
//         return (
//           <IpdOpdPatientList 
//             setCurrentPage={setCurrentPage}
//             setSelectedPatient={setSelectedPatient}
//           />
//         );
//       case 'PatientProfile':
//         return (
//           <PatientProfile 
//             selectedPatient={selectedPatient}
//             setCurrentPage={setCurrentPage}
//           />
//         );
//       case 'AddDoctorNurse':
//         return <AddDoctorNurseForm />;
//       case 'DoctorNurseList':
//         return <DoctorNurseList setCurrentPage={setCurrentPage} />;
//       case 'IncomePage':
//         return <IncomePage />;
//       case 'ExpensePage':
//         return <ExpensePage />;
//       case 'InvoiceListPage':
//         return (
//           <InvoiceListPage 
//             setCurrentPage={setCurrentPage}
//             setSelectedInvoice={setSelectedInvoice}
//           />
//         );
//       case 'InvoiceDetailsPage':
//         return (
//           <InvoiceDetailsPage 
//             selectedInvoice={selectedInvoice}
//             setCurrentPage={setCurrentPage}
//           />
//         );
//       case 'InventoryItemsPage':
//         return <InventoryItemsPage />;
//       case 'BirthReportPage':
//         return <BirthReportPage />;
//       case 'BloodBankPage':
//         return <BloodBankPage />;
//       case 'UserProfilePage':
//         return <UserProfilePage />;
//       case 'SettingsPage':
//         return <SettingsPage />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <Layout
//       sidebarItems={adminSidebar}
//       currentPage={currentPage}
//       setCurrentPage={setCurrentPage}
//       selectedPatient={selectedPatient}
//       setSelectedPatient={setSelectedPatient}
//       selectedInvoice={selectedInvoice}
//       setSelectedInvoice={setSelectedInvoice}
//     >
//       {renderCurrentPage()}
//     </Layout>
//   );
// };

// export default AdminDashboard;

import Layout from '../../../components/Layout';
import Dashboard from '../../../components/dashboard/Dashboard';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';

const AdminHome = () => {
  return (
    <Layout sidebarItems={adminSidebar}>
      <Dashboard />
    </Layout>
  );
};

export default AdminHome;
