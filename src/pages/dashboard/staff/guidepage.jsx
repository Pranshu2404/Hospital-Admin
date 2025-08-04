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
import { Button } from '@/components/ui/button';

const guideItems = [
  {
    icon: HomeIcon,
    title: 'Dashboard',
    description: 'Get a quick snapshot of your daily tasks, notifications, and essential hospital updates in one place.',
    path: '/dashboard/staff'
  },
  {
    icon: AppointmentIcon,
    title: 'Appointments',
    description: 'View upcoming appointments, schedule new ones, and manage bookings efficiently.',
    path: '/dashboard/staff/appointments'
  },
  {
    icon: PatientIcon,
    title: 'Patients',
    description: 'Access patient profiles, add new entries, and monitor their ongoing treatment records.',
    path: '/dashboard/staff/patients'
  },
  {
    icon: DoctorsIcon,
    title: 'Staff',
    description: 'View and update staff information including roles, schedules, and departments.',
    path: '/dashboard/staff/staff'
  },
  {
    icon: FinanceIcon,
    title: 'Finance',
    description: 'Review financial transactions, monitor income and expenses, and manage patient billing.',
    path: '/dashboard/staff/finance'
  },
  {
    icon: MonitorIcon,
    title: 'Reports',
    description: 'Generate hospital reports such as inventory usage, blood bank status, and patient history logs.',
    path: '/dashboard/staff/reports'
  },
  {
    icon: UserProfileIcon,
    title: 'Profile',
    description: 'Edit your personal details, update login credentials, and set availability preferences.',
    path: '/dashboard/staff/profile'
  },
  {
    icon: SettingsIcon,
    title: 'Settings',
    description: 'Customize your notification preferences and configure dashboard display settings.',
    path: '/dashboard/staff/settings'
  },
];

export default function StaffGuidePage() {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={staffSidebar}>
          <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Staff Guide</h2>
            <Accordion type="multiple" className="space-y-4">
              {guideItems.map((step, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-xl border border-teal-200 shadow-sm"
                >
                  <AccordionTrigger className="p-4 font-semibold text-lg text-teal-900 hover:text-teal-600">
                    <div className="flex justify-between w-full items-center gap-3">
                      <div className="flex items-center gap-5 w-full text-nowrap">
                        <step.icon className="text-teal-600 w-8 h-8" />
                        {step.title}
                      </div>
                      <Button
                        className="bg-teal-600 hover:bg-teal-700 text-white mr-5"
                        onClick={() => navigate(step.path)}
                      >
                        Go to {step.title}
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-white px-6 py-4 text-gray-700 space-y-2">
                    {step.description}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Layout>
  );
}
