import { 
  FaChartLine, FaClipboardList, FaProcedures, FaUserInjured, 
  FaFlask, FaPrescriptionBottleAlt, FaUserCog, FaHeartbeat, 
  FaBed, FaNotesMedical, FaVial, FaCalendarAlt 
} from 'react-icons/fa';

export const nurseSidebar = [
  {
    label: 'Dashboard',
    icon: FaChartLine,
    path: '/dashboard/nurse',
  },
  {
    label: 'IPD Ward',
    icon: FaBed,
    submenu: [
      { label: 'Ward Dashboard', path: '/dashboard/nurse/ipd/ward', icon: FaChartLine },
      { label: 'Assigned Patients', path: '/dashboard/nurse/ipd/patients', icon: FaUserInjured },
      { label: 'Nursing Notes', path: '/dashboard/nurse/ipd/nursing-notes', icon: FaNotesMedical },
      { label: 'Shift Handover', path: '/dashboard/nurse/ipd/handover', icon: FaCalendarAlt },
    ],
  },
  {
    label: 'Lab Tests',
    icon: FaFlask,
    path: '/dashboard/nurse/lab-tests',
  },
  {
    label: 'Prescriptions',
    icon: FaPrescriptionBottleAlt,
    path: '/dashboard/nurse/prescriptions',
  },
//   {
//     label: 'Procedures',
//     icon: FaProcedures,
//     path: '/dashboard/nurse/procedures',
//   },
  {
    label: 'Profile',
    icon: FaUserCog,
    path: '/dashboard/nurse/profile',
  },
];