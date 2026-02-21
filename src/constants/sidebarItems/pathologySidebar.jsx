// constants/sidebarItems/pathologySidebar.js
import {
  FaFlask,
  FaClipboardList,
  FaMicroscope,
  FaVial,
  FaFileAlt,
  FaHistory,
  FaUserMd,
  FaSignOutAlt,
  FaFilePrescription // Add this
} from 'react-icons/fa';
import { HomeIcon } from '@radix-ui/react-icons';

export const pathologySidebar = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    path: '/dashboard/pathology',
  },
  {
    label: 'Lab Prescriptions',
    icon: FaFilePrescription,
    path: '/dashboard/pathology/prescriptions',
  },
  {
    label: 'Test Requests',
    icon: FaClipboardList,
    path: '/dashboard/pathology/requests',
  },
  // {
  //   label: 'Pending Tests',
  //   icon: FaMicroscope,
  //   path: '/dashboard/pathology/pending',
  // },
  {
    label: 'In Progress',
    icon: FaVial,
    path: '/dashboard/pathology/in-progress',
  },
  {
    label: 'Completed Tests',
    icon: FaHistory,
    path: '/dashboard/pathology/completed',
  },
  {
    label: 'Reports',
    icon: FaFileAlt,
    path: '/dashboard/pathology/reports',
  },
  {
    label: 'My Profile',
    icon: FaUserMd,
    path: '/dashboard/pathology/profile',
  },
  {
    label: 'Logout',
    icon: FaSignOutAlt,
    path: '/logout',
  },
];