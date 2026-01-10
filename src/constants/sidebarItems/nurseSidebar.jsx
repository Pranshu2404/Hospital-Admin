import { FaTachometerAlt, FaPrescriptionBottleAlt, FaUserMd, FaCalendarCheck } from 'react-icons/fa';

export const nurseSidebar = [
    {
        label: 'Dashboard',
        path: '/dashboard/nurse',
        icon: FaTachometerAlt
    },
    {
        label: 'Appointments',
        path: '/dashboard/nurse/prescriptions',
        icon: FaCalendarCheck
    },
    {
        label: 'Profile',
        path: '/dashboard/nurse/profile',
        icon: FaUserMd
    }
];
