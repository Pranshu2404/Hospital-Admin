// constants/sidebarItems/adminSidebar.js
import {
  FaBook,
  FaClinicMedical,
  FaLock,
  FaFlask, // Add this
} from 'react-icons/fa';
import { HomeIcon } from '@radix-ui/react-icons';
import {
  AppointmentIcon,
  DepartmentIcon,
  DoctorsIcon,
  FinanceIcon,
  PatientIcon,
  StaffIcon,
  UserProfileIcon,
  RoomIcon,
} from '../../components/common/Icons';

export const demoSidebar = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    path: '/dashboard/demo',
  },
  {
    label: 'Guide',
    icon: FaBook,
    path: '/dashboard/demo/guide',
  },
  {
    label: 'Department',
    icon: DepartmentIcon,
    path: '/dashboard/demo/add-department',
    submenu: [
      { label: 'Add Department', path: '/dashboard/demo/add-department' },
      { label: 'Add HOD', path: '/dashboard/demo/add-hod-main' },
      { label: 'HOD List', path: '/dashboard/demo/DepartmentList' },
    ],
  },
  {
    label: 'Doctors',
    icon: DoctorsIcon,
    path: '/dashboard/demo/doctor-list',
    submenu: [
      { label: 'Add Doctor', path: '/dashboard/demo/add-doctor' },
      { label: 'Doctor List', path: '/dashboard/demo/doctor-list' },
    ],
  },
  {
    label: 'Staff',
    icon: StaffIcon,
    path: '/dashboard/demo/staff-list',
    submenu: [
      { label: 'Add Staff', path: '/dashboard/demo/add-staff' },
      { label: 'Staff List', path: '/dashboard/demo/staff-list' },
    ],
  },
  {
    label: 'Create Staff Login',
    icon: FaLock,
    path: '/dashboard/demo/staff-login',
  },
  // {
  //   label: 'Rooms',
  //   icon: RoomIcon,
  //   path: '/dashboard/demo/room-list',
  //   submenu: [
  //     { label: 'Add Room', path: '/dashboard/demo/add-room' },
  //     { label: 'Room List', path: '/dashboard/demo/room-list' },
  //   ],
  // },
  {
    label: 'Patients',
    icon: PatientIcon,
    path: '/dashboard/demo/patient-list',
    submenu: [
      { label: 'Add Patient', path: '/dashboard/demo/add-patient' },
      { label: 'Patient List', path: '/dashboard/demo/patient-list' },
    ],
  },
  {
    label: 'Appointments',
    icon: AppointmentIcon,
    path: '/dashboard/demo/appointments',
  },
  {
    label: 'Pathology/Lab',
    icon: FaFlask,
    path: '/dashboard/demo/lab-tests',
    submenu: [
      { label: 'All Lab Tests', path: '/dashboard/demo/lab-tests' },
      { label: 'Add Lab Test', path: '/dashboard/demo/lab-tests/add' },
      { label: 'Categories', path: '/dashboard/demo/lab-tests/categories' },
      { label: 'Add Pathology Staff', path: '/dashboard/demo/pathology-staff/add' },
      { label: 'Pathology Staff List', path: '/dashboard/demo/pathology-staff' },
    ],
  },
  {
    label: 'Pharmacy',
    icon: FaClinicMedical,
    path: '/dashboard/demo/pharmacies',
    submenu: [
      { label: 'Add Pharmacy', path: '/dashboard/demo/pharmacies/add' },
      { label: 'Pharmacy List', path: '/dashboard/demo/pharmacies' },
    ],
  },
  {
    label: 'Finance',
    icon: FinanceIcon,
    submenu: [
      { label: 'Income', path: '/dashboard/demo/income' },
      { label: 'Expense', path: '/dashboard/demo/expense' },
      { label: 'Invoices', path: '/dashboard/demo/invoices' },
    ],
  },
  {
    label: 'Profile & Settings',
    icon: UserProfileIcon,
    path: '/dashboard/demo/profile',
  },
  { label: 'Forgot Password', path: '/forgot-password', icon: FaLock }
];