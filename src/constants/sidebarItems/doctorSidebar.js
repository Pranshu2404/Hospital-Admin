import {
  HomeIcon,
  AppointmentIcon,
  PatientIcon,
  DoctorsIcon,
  FinanceIcon,
  MonitorIcon,
  UserProfileIcon,
  SettingsIcon
} from '../../components/common/Icons';

export const adminSidebar = [
  { text: 'Dashboard', icon: HomeIcon, page: 'Dashboard' },
  { text: 'Appointments', icon: AppointmentIcon, page: 'AppointmentList' },
  {
    text: 'Patients',
    icon: PatientIcon,
    subItems: [
      { label: 'Add Patient', page: 'AddPatient' },
      { label: 'Patient List', page: 'IpdOpdPatientList' }
    ]
  },
  {
    text: 'Staff',
    icon: DoctorsIcon,
    subItems: [
      { label: 'Add Staff', page: 'AddDoctorNurse' },
      { label: 'Staff List', page: 'DoctorNurseList' }
    ]
  },
  {
    text: 'Finance',
    icon: FinanceIcon,
    subItems: [
      { label: 'Income', page: 'IncomePage' },
      { label: 'Expense', page: 'ExpensePage' },
      { label: 'Invoices', page: 'InvoiceListPage' }
    ]
  },
  {
    text: 'Reports',
    icon: MonitorIcon,
    subItems: [
      { label: 'Inventory', page: 'InventoryItemsPage' },
      { label: 'Birth Report', page: 'BirthReportPage' },
      { label: 'Blood Bank', page: 'BloodBankPage' }
    ]
  },
  { text: 'Profile', icon: UserProfileIcon, page: 'UserProfilePage' },
  { text: 'Settings', icon: SettingsIcon, page: 'SettingsPage' }
];
