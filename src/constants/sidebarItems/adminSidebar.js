// import {
//   HomeIcon,
//   AppointmentIcon,
//   PatientIcon,
//   DoctorsIcon,
//   FinanceIcon,
//   MonitorIcon,
//   UserProfileIcon,
//   SettingsIcon
// } from '../../components/common/Icons';

// export const adminSidebar = [
//   { text: 'Dashboard', icon: HomeIcon, page: 'Dashboard' },
//   { text: 'Appointments', icon: AppointmentIcon, page: 'AppointmentList' },
//   {
//     text: 'Patients',
//     icon: PatientIcon,
//     subItems: [
//       { label: 'Add Patient', page: 'AddPatient' },
//       { label: 'Patient List', page: 'IpdOpdPatientList' }
//     ]
//   },
//   {
//     text: 'Staff',
//     icon: DoctorsIcon,
//     subItems: [
//       { label: 'Add Staff', page: 'AddDoctorNurse' },
//       { label: 'Staff List', page: 'DoctorNurseList' }
//     ]
//   },
//   {
//     text: 'Finance',
//     icon: FinanceIcon,
//     subItems: [
//       { label: 'Income', page: 'IncomePage' },
//       { label: 'Expense', page: 'ExpensePage' },
//       { label: 'Invoices', page: 'InvoiceListPage' }
//     ]
//   },
//   {
//     text: 'Reports',
//     icon: MonitorIcon,
//     subItems: [
//       { label: 'Inventory', page: 'InventoryItemsPage' },
//       { label: 'Birth Report', page: 'BirthReportPage' },
//       { label: 'Blood Bank', page: 'BloodBankPage' }
//     ]
//   },
//   { text: 'Profile', icon: UserProfileIcon, page: 'UserProfilePage' },
//   { text: 'Settings', icon: SettingsIcon, page: 'SettingsPage' }
// ];

// constants/sidebarItems/adminSidebar.js
import {
  HomeIcon,
  AppointmentIcon,
  PatientIcon,
  DoctorsIcon,
  FinanceIcon,
  MonitorIcon,
  UserProfileIcon,
  SettingsIcon,
} from '../../components/common/Icons';

export const adminSidebar = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    path: '/dashboard/admin',
  },
  {
    label: 'Appointments',
    icon: AppointmentIcon,
    path: '/dashboard/admin/appointments',
  },
  {
    label: 'Patients',
    icon: PatientIcon,
    submenu: [
      { label: 'Add Patient', path: '/dashboard/admin/add-patient' },
      { label: 'Patient List', path: '/dashboard/admin/patient-list' },
    ],
  },
  {
    label: 'Doctors',
    icon: DoctorsIcon,
    submenu: [
      { label: 'Add Doctor', path: '/dashboard/admin/add-doctor' },
      { label: 'Doctor List', path: '/dashboard/admin/doctor-list' },
    ],
  },
  {
    label: 'Staff',
    icon: DoctorsIcon,
    submenu: [
      { label: 'Add Staff', path: '/dashboard/admin/add-staff' },
      { label: 'Staff List', path: '/dashboard/admin/staff-list' },
    ],
  },
  {
    label: 'Finance',
    icon: FinanceIcon,
    submenu: [
      { label: 'Income', path: '/dashboard/admin/income' },
      { label: 'Expense', path: '/dashboard/admin/expense' },
      { label: 'Invoices', path: '/dashboard/admin/invoices' },
    ],
  },
  {
    label: 'Reports',
    icon: MonitorIcon,
    submenu: [
      { label: 'Inventory', path: '/dashboard/admin/inventory' },
      { label: 'Birth Report', path: '/dashboard/admin/birth-report' },
      { label: 'Blood Bank', path: '/dashboard/admin/blood-bank' },
    ],
  },
  {
    label: 'Profile',
    icon: UserProfileIcon,
    path: '/dashboard/admin/profile',
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    path: '/dashboard/admin/settings',
  },
];
