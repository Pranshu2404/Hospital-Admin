import {
  HomeIcon,
  FinanceIcon,
  UserProfileIcon
} from '../../components/common/Icons';

export const staffSidebar = [
  {
    label: 'Dashboard',
    icon: HomeIcon,
    path: '/dashboard/staff',
  },
  {
    label: 'Admission',
    icon: HomeIcon,
    path: '/dashboard/staff/admission',
  },
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
