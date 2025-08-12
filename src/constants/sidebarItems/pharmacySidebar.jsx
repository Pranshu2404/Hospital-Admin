import { FaFileAlt } from 'react-icons/fa';
import {
  HomeIcon,
  FinanceIcon,
  InventoryIcon,
  CustomersIcon,
  MedicineIcon,
  SettingsIcon,
  UserProfileIcon,
} from '../../components/common/Icons';

export const pharmacySidebar = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    path: '/dashboard/pharmacy',
  },
  { label: 'Pharmacy Guide', path: '/dashboard/pharmacy/guide', icon: FaFileAlt },
  {
    label: 'Medicines',
    icon: MedicineIcon,
    submenu: [
      { label: 'Add Medicine', path: '/dashboard/pharmacy/add-medicine' },
      { label: 'Medicine List', path: '/dashboard/pharmacy/medicine-list' },
      // { label: 'Medicine Detail', path: '/dashboard/pharmacy/medicine-detail' },
    ],
  },
  {
    label: 'Patients',
    icon: CustomersIcon,
    submenu: [
      { label: 'Add Patient', path: '/dashboard/pharmacy/add-customer' },
      { label: 'Patients List', path: '/dashboard/pharmacy/customers' },
      { label: 'Patients Profile', path: '/dashboard/pharmacy/customer-profile' },
    ],
  },
  {
    label: 'Invoices',
    icon: FinanceIcon,
    submenu: [
      { label: 'Invoice List', path: '/dashboard/pharmacy/invoices' },
      { label: 'Invoice Detail', path: '/dashboard/pharmacy/invoice-detail' },
    ],
  },
  {
    label: 'Inventory',
    icon: InventoryIcon,
    path: '/dashboard/pharmacy/inventory',
  },
  {
    label: 'Profile',
    icon: UserProfileIcon,
    path: '/dashboard/pharmacy/profile',
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    path: '/dashboard/pharmacy/settings',
  },
];
