import { 
 FaChartLine, // Dashboard
  FaBook,          // Staff Guide
  FaCalendarCheck, // Appointments
  FaUserInjured,   // Patients
  FaFileMedical,   // Add Patient
  FaListAlt,       // Patient List
  FaFileInvoiceDollar, // Billing
  FaSignOutAlt,     // Discharges
  FaUserCog,
  FaProcedures,
} from 'react-icons/fa';

export const staffSidebar = [
  {
    label: 'Dashboard',
    icon: FaChartLine,
    path: '/dashboard/staff',
  },
  { 
    label: 'Registrar Guide', 
    path: '/dashboard/staff/guide', 
    icon: FaBook 
  },
  {
    label: 'Appointments',
    icon: FaCalendarCheck,
    path: '/dashboard/staff/appointments',
  },
  {
    label: 'Patients',
    icon: FaUserInjured,
    submenu: [
      { label: 'Add Patient', path: '/dashboard/staff/add-patient', icon: FaFileMedical },
      { label: 'Patient List', path: '/dashboard/staff/patient-list', icon: FaListAlt },
    ],
  },
  {
    label: 'Procedures',
    icon: FaProcedures,
    path: '/dashboard/staff/procedure',
  },
  {
    label: 'Billing',
    icon: FaFileInvoiceDollar,
    path: '/dashboard/staff/billing',
  },
  {
    label: 'Discharges',
    icon: FaSignOutAlt,
    path: '/dashboard/staff/discharges',
  },
  {
    label: 'Profile',
    icon: FaUserCog,
    path: '/dashboard/staff/profile',
  },
];
