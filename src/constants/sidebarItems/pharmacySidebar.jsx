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
    label: 'Suppliers',
    icon: CustomersIcon,
    submenu: [
      { label: 'Add Suppliers', path: '/dashboard/pharmacy/add-supplier' },
      { label: 'Suppliers List',path: '/dashboard/pharmacy/suppliers' },
    ],
  },
  {
    label: 'Medicines',
    icon: MedicineIcon,
    submenu: [
      { label: 'Add Medicine', path: '/dashboard/pharmacy/add-medicine' },
      { label: 'Medicine List', path: '/dashboard/pharmacy/medicine-list' },
      { label: 'Expired Medicine List', path: '/dashboard/pharmacy/expired-medicines' },
      // { label: 'Medicine Detail', path: '/dashboard/pharmacy/medicine-detail' },
    ],
  },
  {
    label: 'Patients',
    icon: CustomersIcon,
    submenu: [
      { label: 'Add Patient', path: '/dashboard/pharmacy/add-customer' },
      { label: 'Patients List', path: '/dashboard/pharmacy/customers' },
      // { label: 'Patients Profile', path: '/dashboard/pharmacy/customer-profile' },
    ],
  },
  {
    label: 'Expense',
    icon: FinanceIcon,
    submenu: [
      { label: 'Expense Management', path: '/dashboard/pharmacy/invoices' },
      { label: 'Expense Detail', path: '/dashboard/pharmacy/invoice-detail' },
    ],
  },
  {
    label: 'Invoice',
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
