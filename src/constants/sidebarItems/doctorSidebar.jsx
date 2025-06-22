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
// };







// import { FaChartLine, FaCalendarCheck, FaFileAlt, FaUserMd, FaFileMedical, FaUsers, FaUserCircle } from 'react-icons/fa';

// export const doctorSidebar = [
//   { label: 'Dashboard', path: '/dashboard/doctor', icon: FaChartLine },
//   { label: 'Appointments', path: '/dashboard/doctor/appointments', icon: FaCalendarCheck },
//   { label: 'Schedule', path: '/dashboard/doctor/schedule', icon: FaFileAlt },
//   {
//     label: 'Doctors',
//     icon: FaUserMd,
//     submenu: [
//       { label: 'All Doctors', path: '/dashboard/doctor/all-doctors' },
//       { label: 'Doctor Details', path: '/dashboard/doctor/doctor-details/1' },
//     ],
//   },
//   { label: 'Patient Files', path: '/dashboard/doctor/patient-files', icon: FaFileMedical },
//   { label: 'Reports & Tests', path: '/dashboard/doctor/reports', icon: FaUsers },
//   { label: 'Profile', path: '/dashboard/doctor/profile', icon: FaUserCircle },
// ];















import {
  FaChartLine,
  FaCalendarCheck,
  FaFileAlt,
  FaUserMd,
  FaFileMedical,
  FaUsers,
  FaUserCircle,
} from 'react-icons/fa';

export const doctorSidebar = [
  { label: 'Dashboard', path: '/dashboard/doctor', icon: FaChartLine },
  { label: 'Appointments', path: '/dashboard/doctor/appointments', icon: FaCalendarCheck },
  { label: 'Schedule', path: '/dashboard/doctor/schedule', icon: FaFileAlt },
  {
    label: 'Doctors',
    icon: FaUserMd,
    submenu: [
      { label: 'All Doctors', path: '/dashboard/doctor/all-doctors' },
      { label: 'Doctor Details', path: '/dashboard/doctor/doctor-details/1' },
    ],
  },
  // { label: 'Patient Files', path: '/dashboard/doctor/patient-files', icon: FaFileMedical },
  { label: 'Reports & Tests', path: '/dashboard/doctor/reports', icon: FaUsers },
  // { label: 'Profile', path: '/dashboard/doctor/profile', icon: FaUserCircle },
];