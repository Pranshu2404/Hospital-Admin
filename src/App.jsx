// App.jsx - Complete updated version with Setup Tracker
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SetupTrackerProvider } from './context/SetupTrackerContext';
import ProtectedRoute from './components/ProtectedRoute';
import SetupTracker from './components/SetupTracker';

// Public pages
import Login from './pages/index';
import Register from './pages/register';

// Admin pages
import AdminHome from './pages/dashboard/admin/index';
import AppointmentsPage from './pages/dashboard/admin/appointments';
import AddPatientPage from './pages/dashboard/admin/add-patient';
import PatientListPage from './pages/dashboard/admin/patient-list';
import PatientProfilePage from './pages/dashboard/admin/patient-profile';
import AddStaffPage from './pages/dashboard/admin/add-staff';
import StaffListPage from './pages/dashboard/admin/staff-list';
import IncomePage from './pages/dashboard/admin/income';
import ExpensePage from './pages/dashboard/admin/expense';
import InvoiceListPage from './pages/dashboard/admin/invoices';
import InvoiceDetailsPage from './pages/dashboard/admin/invoice-details';
import InventoryItemsPage from './pages/dashboard/admin/inventory';
import BirthReportPage from './pages/dashboard/admin/birth-report';
import BloodBankPage from './pages/dashboard/admin/blood-bank';
import UserProfilePage from './pages/dashboard/admin/profile';
import SettingsPage from './pages/dashboard/admin/settings';
import AddDoctorPage from './pages/dashboard/admin/add-doctor.jsx';
import DoctorListPage from './pages/dashboard/admin/doctor-list.jsx';
import StaffProfilePage from './pages/dashboard/admin/staff-profile.jsx';
import DoctorProfilePage from './pages/dashboard/admin/doctor-profile.jsx';
import AddPatientOPD from "./pages/dashboard/admin/AddPatientOPD.jsx";
import AddPatientIPD from "./pages/dashboard/admin/AddPatientIPD.jsx";
import DepartmentList from "./pages/dashboard/admin/DepartmentList.jsx";
import DepartmentAdd from "./pages/dashboard/admin/add-department.jsx";
import AddHodPage from './pages/dashboard/admin/AddHodPage.jsx';
import AdminGuidePage from './pages/dashboard/admin/guidePage.jsx';
import UpdatePatientProfile from './pages/dashboard/admin/UpdatePatientProfile';
import EditDoctor from './pages/dashboard/admin/EditDoctor';
import AddHodMain from './pages/dashboard/admin/add-Hod-main';

// Doctor pages
import DoctorDashboard from './pages/dashboard/doctor/index';
import Appointments from './pages/dashboard/doctor/appointments';
import Records from './pages/dashboard/doctor/records.jsx';
import Prescriptions from './pages/dashboard/doctor/prescriptions';
import DoctorDetails from './pages/dashboard/doctor/Details.jsx';
import DoctorAllList from './pages/dashboard/doctor/DoctorAllList.jsx';
import Reports from './pages/dashboard/doctor/Reports.jsx';
import Schedule from './pages/dashboard/doctor/Schedule.jsx'
import PatientList from './pages/dashboard/doctor/PatientList.jsx'
import DoctorProfilePage1 from './pages/dashboard/doctor/DoctorProfilePage.jsx'

// Staff pages
import StaffDashboard from './pages/dashboard/staff/index';
import Admission from './pages/dashboard/staff/admission';
import Discharges from './pages/dashboard/staff/discharges';
import Billing from './pages/dashboard/staff/billing';

// Pharmacy pages
import PharmacyDashboard from './pages/dashboard/pharmacy/index';
import AddMedicinePage from './pages/dashboard/pharmacy/add-medicine';
import MedicineListPage from './pages/dashboard/pharmacy/medicine-list';
import MedicineDetailPage from './pages/dashboard/pharmacy/medicine-detail';
import AddCustomerPage from './pages/dashboard/pharmacy/add-customer';
import CustomersPage from './pages/dashboard/pharmacy/customers';
import CustomerProfilePage from './pages/dashboard/pharmacy/customer-profile';
import InvoicesPage from './pages/dashboard/pharmacy/invoices';
import InvoiceDetailPage from './pages/dashboard/pharmacy/invoice-detail';
import InventoryPage from './pages/dashboard/pharmacy/inventory';
import ProfilePage from './pages/dashboard/pharmacy/profile';
import Settings from './pages/dashboard/pharmacy/settings';
import AddRegistrarPage from './pages/dashboard/admin/add-registrar.jsx';
import RegistrarListPage from './pages/dashboard/admin/registrar-list.jsx';
import AddNursePage from './pages/dashboard/admin/add-nurse.jsx';
import NurseListPage from './pages/dashboard/admin/nurse-list.jsx';
import NurseProfile from './pages/dashboard/nurse/profile.jsx';
import PharmacyList from './pages/dashboard/admin/PharmacyList.jsx';
import AddPharmacy from './pages/dashboard/admin/AddPharmacy.jsx';
import PharmacyProfile from './pages/dashboard/admin/PharmacyProfile.jsx';
import AddPatientOPD1 from './pages/dashboard/staff/AddPatientOPD.jsx';
import AddPatientIPD1 from './pages/dashboard/staff/AddPatientIPD.jsx';
import AppointmentsPage1 from './pages/dashboard/staff/appointments.jsx';
import AddPatientPage1 from './pages/dashboard/staff/add-patient.jsx';
import PatientListPage1 from './pages/dashboard/staff/patient-list.jsx';
import PatientProfilePage1 from './pages/dashboard/staff/patient-profile.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import DoctorGuide from './pages/dashboard/doctor/guidepage';
import PharmacyGuidePage from './pages/dashboard/pharmacy/guidepage';
import StaffGuidePage from './pages/dashboard/staff/guidepage';
import AppointmentDetails from './pages/dashboard/doctor/AppointmentDetails';
import MyDepartmentPage from './pages/dashboard/doctor/DepartmentPage';
import IPDAppointmentsPage from './pages/dashboard/admin/ipdappointment';
import RoomListPage from './pages/dashboard/admin/RoomList';
import AddRoomPage from './pages/dashboard/admin/AddRoom';
import SuppliersListPage from './pages/dashboard/pharmacy/SuppliersListPage';
import AddSupplierPage from './pages/dashboard/pharmacy/AddSupplierPage';
import ExpiredMedicineAlready from './pages/dashboard/pharmacy/ExpiredMedicineAlready';
import CreateInvoicePage from './components/finance/CreateInvoicePage';
import StockOverview from './pages/dashboard/pharmacy/StockOverview';
import BatchPage from './pages/dashboard/pharmacy/BatchPage';
import LowStock from './pages/dashboard/pharmacy/LowStock';
import Expired from './pages/dashboard/pharmacy/Expired';
import Adjustments from './pages/dashboard/pharmacy/Adjustments';
import Orders from './pages/dashboard/pharmacy/Orders';
import CreateOrder from './pages/dashboard/pharmacy/CreateOrder';
import ReceiveStockPage from './pages/dashboard/pharmacy/ReceiveStock';
import POSPage from './pages/dashboard/pharmacy/POSPage';
import SalesHistoryPage from './pages/dashboard/pharmacy/SalesHistoryPage';
import PrescriptionsList from './pages/dashboard/pharmacy/PrescriptionsList';
import NewPrescriptionPage from './pages/dashboard/pharmacy/NewPrescriptionPage';
import DispensePage from './pages/dashboard/pharmacy/DispensePage';
import PrescriptionsQueue from './pages/dashboard/pharmacy/PrescriptionsQueue';
import PrescriptionDetail from './pages/dashboard/pharmacy/PrescriptionDetail';
import PaymentCollection from './pages/dashboard/pharmacy/PaymentCollectionPage';
import OutstandingPayments from './pages/dashboard/pharmacy/OutstandingPaymentsPage';
import PaySalaryPage from './pages/dashboard/admin/PaySalaryPage';
import DoctorSalaryPage from './pages/dashboard/doctor/DoctorSalaryPage';
import StaffProfilePage1 from './pages/dashboard/staff/staff-profile';

// Nurse Pages
import NurseDashboard from './pages/dashboard/nurse/index';
import NursePrescriptions from './pages/dashboard/nurse/prescriptions';

// Custom Layout Wrappers
const AdminLayout = ({ children }) => (
  <SetupTrackerProvider userRole="admin">
    {children}
    <SetupTracker />
  </SetupTrackerProvider>
);

const DoctorLayout = ({ children }) => (
  <SetupTrackerProvider userRole="doctor">
    {children}
    <SetupTracker />
  </SetupTrackerProvider>
);

const StaffLayout = ({ children }) => (
  <SetupTrackerProvider userRole="staff">
    {children}
    <SetupTracker />
  </SetupTrackerProvider>
);

const PharmacyLayout = ({ children }) => (
  <SetupTrackerProvider userRole="pharmacy">
    {children}
    <SetupTracker />
  </SetupTrackerProvider>
);

const NurseLayout = ({ children }) => (
  <SetupTrackerProvider userRole="nurse">
    {children}
    <SetupTracker />
  </SetupTrackerProvider>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin Routes with Tracker */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminHome />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/appointments"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AppointmentsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/ipd-appointments"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <IPDAppointmentsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/add-patient"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddPatientPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/patient-list"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <PatientListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/patient-profile"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <PatientProfilePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/add-staff"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddStaffPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/add-registrar"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddRegistrarPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/add-nurse"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddNursePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/nurse-list"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <NurseListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          {/* Nurse Routes */}
          <Route
            path="/dashboard/nurse/profile"
            element={
              <ProtectedRoute role="nurse">
                <NurseLayout>
                  <NurseProfile />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/add-doctor"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddDoctorPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/doctor-list"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <DoctorListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/room-list"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <RoomListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/add-room"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddRoomPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/staff-list"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <StaffListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/registrar-list"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <RegistrarListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/staff-profile"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <StaffProfilePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/doctor-profile/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <DoctorProfilePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/income"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <IncomePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/expense"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <ExpensePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/invoices"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <InvoiceListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/invoice-details"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <InvoiceDetailsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/inventory"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <InventoryItemsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/birth-report"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <BirthReportPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/blood-bank"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <BloodBankPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/profile"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <UserProfilePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/settings"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <SettingsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/admin/pharmacies"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <PharmacyList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/admin/pharmacies/add"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddPharmacy />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/admin/pharmacies/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <PharmacyProfile />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/patients/add-opd"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddPatientOPD />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/patients/add-ipd"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddPatientIPD />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/departments/:deptName"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <DepartmentAdd />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/add-department"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <DepartmentAdd />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/add-hod"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddHodPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/DepartmentList"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <DepartmentList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/update-patient/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <UpdatePatientProfile />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/edit-doctor/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <EditDoctor />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/guide"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AdminGuidePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/add-hod-main"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddHodMain />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/finance/salary"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <PaySalaryPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes with Tracker */}
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <DoctorDashboard />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/appointments"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <Appointments />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/appointments/:id"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <AppointmentDetails />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/records"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <Records />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/reports"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <Reports />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/schedule"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <Schedule />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/department"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <MyDepartmentPage />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/profile"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <DoctorProfilePage1 />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/prescriptions"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <Prescriptions />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/all-doctors"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <DoctorAllList />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/patients"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <PatientList />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/doctor-details/:id"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <DoctorDetails />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/guide"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <DoctorGuide />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/salary"
            element={
              <ProtectedRoute role="doctor">
                <DoctorLayout>
                  <DoctorSalaryPage />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />

          {/* Staff Routes with Tracker */}
          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <StaffDashboard />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/admission"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <Admission />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/discharges"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <Discharges />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/billing"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <Billing />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/add-hod/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <AddHodPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/patients/add-opd"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <AddPatientOPD1 />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/patients/add-ipd"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <AddPatientIPD1 />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/appointments"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <AppointmentsPage1 />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/add-patient"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <AddPatientPage1 />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/patient-list"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <PatientListPage1 />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/profile"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <StaffProfilePage1 />
                </StaffLayout>
              </ProtectedRoute>
            }
          />

          {/* Nurse Routes */}
          <Route
            path="/dashboard/nurse"
            element={
              <ProtectedRoute role="nurse">
                <NurseLayout>
                  <NurseDashboard />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/nurse/prescriptions"
            element={
              <ProtectedRoute role="nurse">
                <NurseLayout>
                  <NursePrescriptions />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/patient-profile"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <PatientProfilePage1 />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/guide"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <StaffGuidePage />
                </StaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/update-patient/:id"
            element={
              <ProtectedRoute role="staff">
                <StaffLayout>
                  <UpdatePatientProfile />
                </StaffLayout>
              </ProtectedRoute>
            }
          />

          {/* Pharmacy Routes with Tracker */}
          <Route
            path="/dashboard/pharmacy"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <PharmacyDashboard />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/add-medicine"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <AddMedicinePage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/medicine-list"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <MedicineListPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/inventory/overview"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <StockOverview />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/low-stock"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <LowStock />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/expired"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <Expired />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/adjustments"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <Adjustments />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/medicine-detail/:id"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <MedicineDetailPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/batches"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <BatchPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/orders"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <Orders />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/pos"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <POSPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/history"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <SalesHistoryPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/create-order"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <CreateOrder />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/receive-stock/:id"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <ReceiveStockPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/add-customer"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <AddCustomerPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/customers"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <CustomersPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/customer-profile"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <CustomerProfilePage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/invoices"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <InvoicesPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/prescriptions/list"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <PrescriptionsList />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/prescriptions/new"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <NewPrescriptionPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/prescriptions/dispense"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <DispensePage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/prescriptions/queue"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <PrescriptionsQueue />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/prescriptions/:id"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <PrescriptionDetail />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/invoice-detail"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <InvoiceDetailPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/billing/payments"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <PaymentCollection />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/billing/outstanding"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <OutstandingPayments />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/inventory"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <InventoryPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/profile"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <ProfilePage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/settings"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <Settings />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/suppliers"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <SuppliersListPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/add-supplier"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <AddSupplierPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/expired-medicines"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <ExpiredMedicineAlready />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/guide"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <PharmacyGuidePage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/finance/create-invoice"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout>
                  <CreateInvoicePage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/pharmacy/purchase/:id"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout>
                  <BatchPage />
                </PharmacyLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}