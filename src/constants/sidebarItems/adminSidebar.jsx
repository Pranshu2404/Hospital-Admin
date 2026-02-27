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

export const adminSidebar = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    path: '/dashboard/admin',
  },
  {
    label: 'Guide',
    icon: FaBook,
    path: '/dashboard/admin/guide',
  },
  {
    label: 'Department',
    icon: DepartmentIcon,
    path: '/dashboard/admin/add-department',
    submenu: [
      { label: 'Add Department', path: '/dashboard/admin/add-department' },
      { label: 'Add HOD', path: '/dashboard/admin/add-hod-main' },
      { label: 'HOD List', path: '/dashboard/admin/DepartmentList' },
    ],
  },
  {
    label: 'Doctors',
    icon: DoctorsIcon,
    path: '/dashboard/admin/doctor-list',
    submenu: [
      { label: 'Add Doctor', path: '/dashboard/admin/add-doctor' },
      { label: 'Doctor List', path: '/dashboard/admin/doctor-list' },
    ],
  },
  {
    label: 'Staff',
    icon: StaffIcon,
    path: '/dashboard/admin/staff-list',
    submenu: [
      { label: 'Add Staff', path: '/dashboard/admin/add-staff' },
      { label: 'Staff List', path: '/dashboard/admin/staff-list' },
    ],
  },
  {
    label: 'Create Staff Login',
    icon: FaLock,
    path: '/dashboard/admin/staff-login',
  },
  // {
  //   label: 'Rooms',
  //   icon: RoomIcon,
  //   path: '/dashboard/admin/room-list',
  //   submenu: [
  //     { label: 'Add Room', path: '/dashboard/admin/add-room' },
  //     { label: 'Room List', path: '/dashboard/admin/room-list' },
  //   ],
  // },
  {
    label: 'Patients',
    icon: PatientIcon,
    path: '/dashboard/admin/patient-list',
    submenu: [
      { label: 'Add Patient', path: '/dashboard/admin/add-patient' },
      { label: 'Patient List', path: '/dashboard/admin/patient-list' },
    ],
  },
  {
    label: 'Appointments',
    icon: AppointmentIcon,
    path: '/dashboard/admin/appointments',
  },
  {
    label: 'Pathology/Lab',
    icon: FaFlask,
    path: '/dashboard/admin/lab-tests',
    submenu: [
      { label: 'All Lab Tests', path: '/dashboard/admin/lab-tests' },
      { label: 'Add Lab Test', path: '/dashboard/admin/lab-tests/add' },
      { label: 'Categories', path: '/dashboard/admin/lab-tests/categories' },
      { label: 'Add Pathology Staff', path: '/dashboard/admin/pathology-staff/add' },
      { label: 'Pathology Staff List', path: '/dashboard/admin/pathology-staff' },
    ],
  },
  {
    label: 'Pharmacy',
    icon: FaClinicMedical,
    path: '/dashboard/admin/pharmacies',
    submenu: [
      { label: 'Add Pharmacy', path: '/dashboard/admin/pharmacies/add' },
      { label: 'Pharmacy List', path: '/dashboard/admin/pharmacies' },
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
    label: 'Profile & Settings',
    icon: UserProfileIcon,
    path: '/dashboard/admin/profile',
  },
  { label: 'Forgot Password', path: '/forgot-password', icon: FaLock }
];