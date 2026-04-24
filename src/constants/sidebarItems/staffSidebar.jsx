import { 
  FaChartLine,
  FaBook, 
  FaCalendarCheck,
  FaUserInjured,
  FaFileMedical,
  FaListAlt,      
  FaFileInvoiceDollar,
  FaSignOutAlt,   
  FaUserCog,
  FaProcedures,
  FaFlask,
  FaHospitalUser, 
  FaBed, 
  FaMoneyBillWave, 
  FaFileAlt,
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
    label: 'IPD Management',
    icon: FaHospitalUser,
    submenu: [
      { label: 'IPD Dashboard', path: '/dashboard/staff/ipd/dashboard', icon: FaChartLine },
      { label: 'Admit Patient', path: '/dashboard/staff/ipd/admit', icon: FaUserInjured },
      { label: 'Active Admissions', path: '/dashboard/staff/ipd/admissions', icon: FaHospitalUser },
      { label: 'Bed Board', path: '/dashboard/staff/ipd/beds', icon: FaBed },
    ],
  },
  {
    label: 'Procedures',
    icon: FaProcedures,
    path: '/dashboard/staff/procedure',
  },
  {
    label: 'Lab Tests',
    icon: FaFlask,
    path: '/dashboard/staff/lab-tests',
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