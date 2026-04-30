
import {
  FaChartLine,
  FaCalendarCheck,
  FaFileAlt,
  FaUsers,
  FaUserCircle,
  FaUserFriends,
  FaLock,
  FaMoneyBill,
  FaUserInjured,
  FaStethoscope,
  FaHospitalUser,
  FaXRay,
} from 'react-icons/fa';
import { DepartmentIcon } from '../../components/common/Icons';

export const doctorSidebar = [
  { label: 'Dashboard', path: '/dashboard/doctor', icon: FaChartLine },
  { label: 'Doctor Guide', path: '/dashboard/doctor/guide', icon: FaFileAlt },
  { label: 'Appointments', path: '/dashboard/doctor/appointments', icon: FaCalendarCheck },
  { label: 'Schedule', path: '/dashboard/doctor/schedule', icon: FaFileAlt },
  // {
  //   label: 'Doctors',
  //   icon: FaUserMd,
  //   submenu: [
  //     { label: 'All Doctors', path: '/dashboard/doctor/all-doctors' },
  //     { label: 'Doctor Details', path: '/dashboard/doctor/doctor-details/1' },
  //   ],
  // },
  {
  label: 'IPD Patients',
  icon: FaHospitalUser,
  submenu: [
    { label: 'My IPD Patients', path: '/dashboard/doctor/ipd/patients', icon: FaUserInjured },
    // { label: 'Discharge Summary', path: '/dashboard/doctor/ipd/discharge-summary', icon: FaFileAlt },
  ],
},
  { label: 'My Patients', path: '/dashboard/doctor/patients', icon: FaUserFriends },
  { label: 'My Department', path: '/dashboard/doctor/department', icon: DepartmentIcon },
  { label: 'Reports & Tests', path: '/dashboard/doctor/reports', icon: FaUsers },
  { label: 'Radiology Orders', path: '/dashboard/doctor/radiology', icon: FaXRay },
  { label: 'Fees & Collections', path:'/dashboard/doctor/salary', icon: FaMoneyBill},
  { label: 'Profile', path: '/dashboard/doctor/profile', icon: FaUserCircle },
  { label: 'Forgot Password', path: '/forgot-password', icon: FaLock }
];