// import { FaFileAlt } from 'react-icons/fa';
// import {
//   HomeIcon,
//   FinanceIcon,
//   InventoryIcon,
//   CustomersIcon,
//   MedicineIcon,
//   SettingsIcon,
//   UserProfileIcon,
// } from '../../components/common/Icons';

// export const pharmacySidebar = [
//   {
//     label: 'Dashboard',
//     icon: HomeIcon,
//     path: '/dashboard/pharmacy',
//   },
//   { label: 'Pharmacy Guide', path: '/dashboard/pharmacy/guide', icon: FaFileAlt },
//   {
//     label: 'Suppliers',
//     icon: CustomersIcon,
//     submenu: [
//       { label: 'Add Suppliers', path: '/dashboard/pharmacy/add-supplier' },
//       { label: 'Suppliers List',path: '/dashboard/pharmacy/suppliers' },
//     ],
//   },
//   {
//     label: 'Medicines',
//     icon: MedicineIcon,
//     submenu: [
//       { label: 'Add Medicine', path: '/dashboard/pharmacy/add-medicine' },
//       { label: 'Medicine List', path: '/dashboard/pharmacy/medicine-list' },
//       { label: 'Expired Medicine List', path: '/dashboard/pharmacy/expired-medicines' },
//       // { label: 'Medicine Detail', path: '/dashboard/pharmacy/medicine-detail' },
//     ],
//   },
//   {
//     label: 'Patients',
//     icon: CustomersIcon,
//     submenu: [
//       { label: 'Add Patient', path: '/dashboard/pharmacy/add-customer' },
//       { label: 'Patients List', path: '/dashboard/pharmacy/customers' },
//       // { label: 'Patients Profile', path: '/dashboard/pharmacy/customer-profile' },
//     ],
//   },
//   {
//     label: 'Expense',
//     icon: FinanceIcon,
//     submenu: [
//       { label: 'Expense Management', path: '/dashboard/pharmacy/invoices' },
//       { label: 'Expense Detail', path: '/dashboard/pharmacy/invoice-detail' },
//     ],
//   },
//   {
//     label: 'Invoice',
//     icon: InventoryIcon,
//     path: '/dashboard/pharmacy/inventory',
//   },
//   {
//     label: 'Profile',
//     icon: UserProfileIcon,
//     path: '/dashboard/pharmacy/profile',
//   },
//   {
//     label: 'Settings',
//     icon: SettingsIcon,
//     path: '/dashboard/pharmacy/settings',
//   },
// ];

import { FaFileAlt, FaPrescription, FaShoppingCart, FaClipboardList, FaExchangeAlt, FaChartBar, FaWarehouse } from 'react-icons/fa';
import {
  HomeIcon,
  FinanceIcon,
  InventoryIcon,
  SettingsIcon,
  UserProfileIcon,
} from '../../components/common/Icons';

export const pharmacySidebar = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    path: '/dashboard/pharmacy',
  },
  { 
    label: 'Pharmacy Guide', 
    path: '/dashboard/pharmacy/guide', 
    icon: FaFileAlt 
  },
  
  // Inventory Management Section
  {
    label: 'Inventory',
    icon: InventoryIcon,
    submenu: [
      { label: 'Stock Overview', path: '/dashboard/pharmacy/inventory/overview' },
      { label: 'Medicine List', path: '/dashboard/pharmacy/medicine-list' },
      { label: 'Add Medicine', path: '/dashboard/pharmacy/add-medicine' },
      { label: 'Batch Management', path: '/dashboard/pharmacy/batches' },
      { label: 'Low Stock Alert', path: '/dashboard/pharmacy/low-stock' },
      { label: 'Expired Medicines', path: '/dashboard/pharmacy/expired' },
      { label: 'Stock Adjustments', path: '/dashboard/pharmacy/adjustments' },
    ],
  },
  
  // Purchasing & Suppliers
  {
    label: 'Purchasing',
    icon: FaShoppingCart,
    submenu: [
      { label: 'Suppliers List', path: '/dashboard/pharmacy/suppliers' },
      { label: 'Add Supplier', path: '/dashboard/pharmacy/add-supplier' },
      { label: 'Purchase Orders', path: '/dashboard/pharmacy/orders' },
      { label: 'Create Purchase Order', path: '/dashboard/pharmacy/create-order' },
      // { label: 'Receive Stock', path: '/dashboard/pharmacy/receive-stock' },
    ],
  },
  
  // Sales & Customers
  {
    label: 'Sales',
    icon: FinanceIcon,
    submenu: [
      { label: 'Point of Sale', path: '/dashboard/pharmacy/pos' },
      { label: 'Sales History', path: '/dashboard/pharmacy/history' },
      { label: 'Customers List', path: '/dashboard/pharmacy/customers' },
      { label: 'Add Customer', path: '/dashboard/pharmacy/add-customer' },
      { label: 'Invoices', path: '/dashboard/pharmacy/invoices' },
      // { label: 'Create Invoice', path: '/dashboard/pharmacy/create-invoice' },
    ],
  },
  
  // Prescriptions
  {
    label: 'Prescriptions',
    icon: FaPrescription,
    submenu: [
      { label: 'All Prescriptions', path: '/dashboard/pharmacy/prescriptions/list' },
      { label: 'New Prescription', path: '/dashboard/pharmacy/prescriptions/new' },
      { label: 'Dispense Medication', path: '/dashboard/pharmacy/prescriptions/dispense' },
      { label: 'Prescription Queue', path: '/dashboard/pharmacy/prescriptions/queue' },
    ],
  },
  
  // Billing & Invoicing
  {
    label: 'Billing',
    icon: FaClipboardList,
    submenu: [
      // { label: 'All Bills', path: '/dashboard/pharmacy/billing/bills' },
      { label: 'All Invoices', path: '/dashboard/pharmacy/invoices' },
      { label: 'Payment Collection', path: '/dashboard/pharmacy/billing/payments' },
      { label: 'Outstanding Payments', path: '/dashboard/pharmacy/billing/outstanding' },
    ],
  },
  
  // Reports & Analytics
  {
    label: 'Reports',
    icon: FaChartBar,
    submenu: [
      { label: 'Sales Reports', path: '/dashboard/pharmacy/reports/sales' },
      { label: 'Inventory Reports', path: '/dashboard/pharmacy/reports/inventory' },
      { label: 'Profit & Loss', path: '/dashboard/pharmacy/reports/profit-loss' },
      { label: 'Expiry Reports', path: '/dashboard/pharmacy/reports/expiry' },
      { label: 'Supplier Reports', path: '/dashboard/pharmacy/reports/suppliers' },
    ],
  },
  
  // Transfers & Returns
  {
    label: 'Transfers & Returns',
    icon: FaExchangeAlt,
    submenu: [
      { label: 'Stock Transfers', path: '/dashboard/pharmacy/transfers/stock' },
      { label: 'Returns to Supplier', path: '/dashboard/pharmacy/transfers/returns' },
      { label: 'Damage/Waste', path: '/dashboard/pharmacy/transfers/damage' },
    ],
  },
  
  // Profile & Settings
  {
    label: 'Profile',
    icon: UserProfileIcon,
    path: '/dashboard/pharmacy/profile',
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    submenu: [
      { label: 'Pharmacy Settings', path: '/dashboard/pharmacy/settings/general' },
      { label: 'Tax Configuration', path: '/dashboard/pharmacy/settings/tax' },
      { label: 'User Management', path: '/dashboard/pharmacy/settings/users' },
      { label: 'Backup & Restore', path: '/dashboard/pharmacy/settings/backup' },
    ],
  },
];