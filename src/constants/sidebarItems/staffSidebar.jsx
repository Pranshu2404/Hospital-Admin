import { FaFileAlt } from 'react-icons/fa';
import {
  HomeIcon,
  FinanceIcon,
  UserProfileIcon,
  AppointmentIcon,
  PatientIcon
} from '../../components/common/Icons';

export const staffSidebar = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    path: '/dashboard/staff',
  },
  { label: 'Staff Guide', path: '/dashboard/staff/guide', icon: FaFileAlt },
  {
      label: 'Appointments',
      icon: AppointmentIcon,
      path: '/dashboard/staff/appointments',
    },
    {
      label: 'Patients',
      icon: PatientIcon,
      submenu: [
        { label: 'Add Patient', path: '/dashboard/staff/add-patient' },
        { label: 'Patient List', path: '/dashboard/staff/patient-list' },
      ],
    },
  // {
  //   label: 'Admission',
  //   icon: HomeIcon,
  //   path: '/dashboard/staff/admission',
  // },
  {
    label: 'Billing',
    icon: FinanceIcon,
    path: '/dashboard/staff/billing',
  },
  {
    label: 'Discharges',
    icon: UserProfileIcon,
    path: '/dashboard/staff/discharges',
  },
];
