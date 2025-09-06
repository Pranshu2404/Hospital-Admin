import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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
// import PharmacyDashboardPage from './pages/dashboard/pharmacy/';
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
import ReceiveStock from './components/pharmacy/ReceiveStock';
import ReceiveStockPage from './pages/dashboard/pharmacy/ReceiveStock';
import POSPage from './pages/dashboard/pharmacy/POSPage';
import SalesHistoryPage from './pages/dashboard/pharmacy/SalesHistoryPage';
import PrescriptionsList from './pages/dashboard/pharmacy/PrescriptionsList';
import NewPrescriptionPage from './pages/dashboard/pharmacy/NewPrescriptionPage';
import DispensePage from './pages/dashboard/pharmacy/DispensePage';
import PrescriptionQueue from './pages/dashboard/pharmacy/PrescriptionsQueue';
import PrescriptionsQueue from './pages/dashboard/pharmacy/PrescriptionsQueue';
import PaymentCollection from './pages/dashboard/pharmacy/PaymentCollectionPage';
import OutstandingPayments from './pages/dashboard/pharmacy/OutstandingPaymentsPage';
import PaySalaryPage from './pages/dashboard/admin/PaySalaryPage';
import DoctorSalaryPage from './pages/dashboard/doctor/DoctorSalaryPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={<AdminHome />} />
          <Route path="/dashboard/admin/appointments" element={<AppointmentsPage />} />
          <Route path="/dashboard/admin/ipd-appointments" element={<IPDAppointmentsPage />} />
          <Route path="/dashboard/admin/add-patient" element={<AddPatientPage />} />
          <Route path="/dashboard/admin/patient-list" element={<PatientListPage />} />
          <Route path="/dashboard/admin/patient-profile" element={<PatientProfilePage />} />
          <Route path="/dashboard/admin/add-staff" element={<AddStaffPage />} />
          <Route path="/dashboard/admin/add-registrar" element={<AddRegistrarPage />} />
          <Route path="/dashboard/admin/add-doctor" element={<AddDoctorPage />} />
          <Route path="/dashboard/admin/doctor-list" element={<DoctorListPage />} />
          <Route path="/dashboard/admin/room-list" element={<RoomListPage />} />
          <Route path="/dashboard/admin/add-room" element={<AddRoomPage />} />
          <Route path="/dashboard/admin/staff-list" element={<StaffListPage />} />
          <Route path="/dashboard/admin/registrar-list" element={<RegistrarListPage />} />
          <Route path="/dashboard/admin/staff-profile" element={<StaffProfilePage />} />
          <Route path="/dashboard/admin/doctor-profile/:id" element={<DoctorProfilePage />} />
          <Route path="/dashboard/admin/income" element={<IncomePage />} />
          <Route path="/dashboard/admin/expense" element={<ExpensePage />} />
          <Route path="/dashboard/admin/invoices" element={<InvoiceListPage />} />
          <Route path="/dashboard/admin/invoice-details" element={<InvoiceDetailsPage />} />
          <Route path="/dashboard/admin/inventory" element={<InventoryItemsPage />} />
          <Route path="/dashboard/admin/birth-report" element={<BirthReportPage />} />
          <Route path="/dashboard/admin/blood-bank" element={<BloodBankPage />} />
          <Route path="/dashboard/admin/profile" element={<UserProfilePage />} />
          <Route path="/dashboard/admin/settings" element={<SettingsPage />} />
          <Route path="dashboard/admin/pharmacies" element={<PharmacyList />} />
          <Route path="dashboard/admin/pharmacies/add" element={<AddPharmacy />} />
          <Route path="dashboard/admin/pharmacies/:id" element={<PharmacyProfile />} />
          <Route path="/dashboard/admin/patients/add-opd" element={<AddPatientOPD />} />
          <Route path="/dashboard/admin/patients/add-ipd" element={<AddPatientIPD />} />         
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* <Route path="/dashboard/admin/departments" element={<DepartmentList />} /> */}
          <Route path="/dashboard/admin/departments/:deptName" element={<DepartmentAdd />} />
          <Route path="/dashboard/admin/add-department" element={<DepartmentAdd />} /> 
          <Route path="/dashboard/admin/add-department" element={<DepartmentAdd />} />  
          <Route path="/dashboard/admin/add-hod" element={<AddHodPage />} />
          <Route path="/dashboard/admin/DepartmentList" element={<DepartmentList />} />

          <Route path="/dashboard/admin/update-patient/:id" element={<UpdatePatientProfile />} />
          <Route path="/dashboard/staff/update-patient/:id" element={<UpdatePatientProfile />} />
          <Route path="/dashboard/admin/edit-doctor/:id" element={<EditDoctor />} />

          <Route path="/dashboard/admin/guide" element={<AdminGuidePage />} />
          <Route path="/dashboard/doctor/guide" element={<DoctorGuide />} />
          <Route path="/dashboard/pharmacy/guide" element={<PharmacyGuidePage />} />
          <Route path="/dashboard/staff/guide" element={<StaffGuidePage />} />
          <Route path="/dashboard/admin/add-hod-main" element={<AddHodMain />} />

          {/* Doctor Routes */}
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor/appointments"
            element={
              <ProtectedRoute role="doctor">
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route path="/doctor/appointments/:id" element={
            <ProtectedRoute role="doctor">
                  <AppointmentDetails/>
            </ProtectedRoute>
            } 
          />

          <Route
            path="/dashboard/doctor/records"
            element={
              <ProtectedRoute role="doctor">
                <Records />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/doctor/reports"
            element={
              <ProtectedRoute role="doctor">
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/doctor/schedule"
            element={
              <ProtectedRoute role="doctor">
                <Schedule />
              </ProtectedRoute>
            }
          />

          <Route path="/dashboard/doctor/department" element={<MyDepartmentPage />} />

          <Route
            path="/dashboard/doctor/prescriptions"
            element={
              <ProtectedRoute role="doctor">
                <Prescriptions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/doctor/all-doctors"
            element={
              <ProtectedRoute role="doctor">
                <DoctorAllList/>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/doctor/patients"
            element={
              <ProtectedRoute role="doctor">
                <PatientList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/doctor/doctor-details/:id"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDetails />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute role="staff">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/admission"
            element={
              <ProtectedRoute role="staff">
                <Admission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/discharges"
            element={
              <ProtectedRoute role="staff">
                <Discharges />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff/billing"
            element={
              <ProtectedRoute role="staff">
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard/admin/add-hod/:id" element={<AddHodPage />} />
          <Route path="/dashboard/staff/patients/add-opd" element={<AddPatientOPD1 />} />
          <Route path="/dashboard/staff/patients/add-ipd" element={<AddPatientIPD1 />} />
          <Route path="/dashboard/staff/appointments" element={<AppointmentsPage1 />} />
          <Route path="/dashboard/staff/add-patient" element={<AddPatientPage1 />} />
          <Route path="/dashboard/staff/patient-list" element={<PatientListPage1 />} />
          <Route path="/dashboard/staff/patient-profile" element={<PatientProfilePage1 />} />
            {/* Pharmacy Routes */}
          <Route path="/dashboard/pharmacy" element={<PharmacyDashboard />} />
          
          <Route path="/dashboard/pharmacy/add-medicine" element={<AddMedicinePage />} />
          <Route path="/dashboard/pharmacy/medicine-list" element={<MedicineListPage />} />
          <Route path="/dashboard/pharmacy/inventory/overview" element={<StockOverview/>} />
          <Route path="/dashboard/pharmacy/low-stock" element={<LowStock/>} />
          <Route path="/dashboard/pharmacy/expired" element={<Expired/>} />
          <Route path="/dashboard/pharmacy/adjustments" element={<Adjustments/>} />
          <Route path="/dashboard/pharmacy/medicine-detail/:id" element={<MedicineDetailPage />} />
          <Route path="/dashboard/pharmacy/batches" element={<BatchPage/>}/>
          <Route path="/dashboard/pharmacy/orders" element={<Orders/>}/>
          <Route path="/dashboard/pharmacy/pos" element={<POSPage/>}/>
          <Route path="/dashboard/pharmacy/history" element={<SalesHistoryPage/>}/>
          <Route path="/dashboard/pharmacy/pos" element={<POSPage/>}/>
          <Route path="/dashboard/pharmacy/create-order" element={<CreateOrder/>}/>
          <Route path="/dashboard/pharmacy/receive-stock/:id" element={<ReceiveStockPage/>}/>
          <Route path="/dashboard/pharmacy/add-customer" element={<AddCustomerPage />} />
          <Route path="/dashboard/pharmacy/customers" element={<CustomersPage />} />
          <Route path="/dashboard/pharmacy/customer-profile" element={<CustomerProfilePage />} />
          <Route path="/dashboard/pharmacy/invoices" element={<InvoicesPage />} />
          <Route path="/dashboard/pharmacy/prescriptions/list" element={<PrescriptionsList />} />
          <Route path="/dashboard/pharmacy/prescriptions/new" element={<NewPrescriptionPage />} />
          <Route path="/dashboard/pharmacy/prescriptions/dispense" element={<DispensePage />} />
          <Route path="/dashboard/admin/finance/salary" element={<PaySalaryPage />} />
          <Route path="/dashboard/doctor/salary" element={<DoctorSalaryPage />} />
          <Route path="/dashboard/pharmacy/prescriptions/queue" element={<PrescriptionsQueue />} />
          <Route path="/dashboard/pharmacy/invoice-detail" element={<InvoiceDetailPage />} />
          <Route path="/dashboard/pharmacy/billing/payments" element={<PaymentCollection />} />
          <Route path="/dashboard/pharmacy/billing/outstanding" element={<OutstandingPayments />} />
          <Route path="/dashboard/pharmacy/inventory" element={<InventoryPage />} />
          <Route path="/dashboard/pharmacy/profile" element={<ProfilePage />} />
          <Route path="/dashboard/pharmacy/settings" element={<Settings />} />
          <Route path="/dashboard/pharmacy/suppliers" element={<SuppliersListPage />} />
          <Route path="/dashboard/pharmacy/add-supplier" element={<AddSupplierPage />} /> 
          <Route 
            path="/dashboard/pharmacy/expired-medicines" 
            element={<ExpiredMedicineAlready />} 
          />   
          <Route 
            path="/dashboard/finance/create-invoice" 
            element={<CreateInvoicePage />} 
          />      
        </Routes>
        


      </AuthProvider>
    </Router>
      );
}