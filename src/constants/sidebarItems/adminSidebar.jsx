
import { FaClinicMedical } from 'react-icons/fa';
import {
  HomeIcon,
  AppointmentIcon,
  PatientIcon,
  // DoctorsIcon,
  FinanceIcon,
  MonitorIcon,
  UserProfileIcon,
  SettingsIcon,
  DoctorsIcon,
  DepartmentIcon,
  StaffIcon,
  RegistrarIcon,
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
    label: 'Department',
    icon: DepartmentIcon,
    submenu: [
      { label: 'Add Department', path: '/dashboard/admin/add-department' },
      { label: 'HOD List', path: '/dashboard/admin/DepartmentList' },
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
    label: 'Patients',
    icon: PatientIcon,
    submenu: [
      { label: 'Add Patient', path: '/dashboard/admin/add-patient' },
      { label: 'Patient List', path: '/dashboard/admin/patient-list' },
    ],
  },

  //  {
  //   label: 'Department',
  //   icon: DoctorsIcon,
  //   submenu: [
  //     { label: 'Add Department', path: '/dashboard/admin/add-department' },
  //     // { label: 'HOD List', path: '/dashboard/admin/department-list' },
  //     { label: 'HOD List', path: '/dashboard/admin/DepartmentList' },
  //   ],
  // },
  // {
  //   label: 'Doctors',
  //   icon: DoctorsIcon,
  //   submenu: [
  //     { label: 'Add Doctor', path: '/dashboard/admin/add-doctor' },
  //     { label: 'Doctor List', path: '/dashboard/admin/doctor-list' },
  //   ],
  // },
  // {
  //   label: 'staff',
  //   icon: DoctorsIcon,
  //   submenu: [
  //     // { label: 'Add Registrar', path: '/dashboard/admin/add-staff' },
  //     // { label: 'Staff List', path: '/dashboard/admin/staff-list' },
  //   ],
  // },
  // {
  //   label: 'Registrar',
  //   icon: DoctorsIcon,
  //   submenu: [
  //     { label: 'Add Staff', path: '/dashboard/admin/add-staff' },
  //     { label: 'Staff List', path: '/dashboard/admin/staff-list' },
  //   ],
  // },


  
  {
    label: 'Staff',
    icon: StaffIcon,
    submenu: [
      { label: 'Add Staff', path: '/dashboard/admin/add-staff' },
      { label: 'Staff List', path: '/dashboard/admin/staff-list' },
    ],
  },
  {
    label: 'Registrar',
    icon: RegistrarIcon,
    submenu: [
      { label: 'Add Registrar', path: '/dashboard/admin/add-registrar' },
      { label: 'Registrar List', path: '/dashboard/admin/registrar-list' },
    ],
  },
  {
    label: 'Pharmacy',
    icon: FaClinicMedical,
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
