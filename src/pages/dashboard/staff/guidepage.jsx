import React from 'react';
import {
  HomeIcon,
  AppointmentIcon,
  PatientIcon,
  DoctorsIcon,
  FinanceIcon,
  MonitorIcon,
  UserProfileIcon,
  SettingsIcon
} from '@/components/common/Icons';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';

const guideItems = [
  {
    icon: HomeIcon,
    title: 'Dashboard',
    description: 'Overview of staff activities and quick stats.',
    path: '/dashboard/staff'
  },
  {
    icon: AppointmentIcon,
    title: 'Appointments',
    description: 'Manage and view patient appointments.',
    path: '/dashboard/staff/appointments'
  },
  {
    icon: PatientIcon,
    title: 'Patients',
    description: 'Add, view and manage patient records.',
    path: '/dashboard/staff/patients'
  },
  {
    icon: DoctorsIcon,
    title: 'Staff',
    description: 'Manage staff information and access.',
    path: '/dashboard/staff/staff'
  },
  {
    icon: FinanceIcon,
    title: 'Finance',
    description: 'Track income, expenses, and invoices.',
    path: '/dashboard/staff/finance'
  },
  {
    icon: MonitorIcon,
    title: 'Reports',
    description: 'Generate and review medical and admin reports.',
    path: '/dashboard/staff/reports'
  },
  {
    icon: UserProfileIcon,
    title: 'Profile',
    description: 'Update your profile and preferences.',
    path: '/dashboard/staff/profile'
  },
  {
    icon: SettingsIcon,
    title: 'Settings',
    description: 'Manage system and notification settings.',
    path: '/dashboard/staff/settings'
  },
];

export default function StaffGuidePage() {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={staffSidebar}>
    <div className="p-6">
      <h1 className="text-3xl font-bold text-teal-600 mb-6">Staff Dashboard Guide</h1>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {guideItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <AccordionItem key={index} value={`item-${index}`} className="rounded-xl border border-teal-200 shadow-sm">
              <AccordionTrigger className="flex items-center justify-between px-4 py-3 text-left hover:bg-teal-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-teal-100 text-teal-600 flex items-center justify-center rounded-full">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-lg">{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-gray-700 text-base">
                <p className="mb-2">{item.description}</p>
                <button
                  onClick={() => navigate(item.path)}
                  className="text-sm text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-md transition"
                >
                  Go to {item.title}
                </button>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
    </Layout>
  );
}
