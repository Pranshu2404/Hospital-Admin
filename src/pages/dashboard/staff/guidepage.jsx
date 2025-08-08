import React from 'react';
import {
  HomeIcon,
  AppointmentIcon,
  FinanceIcon,
  MonitorIcon,
} from '@/components/common/Icons';
import {
  FaChartLine,
  FaCalendarCheck,
  FaFileAlt,
  FaUserMd,
  FaFileMedical,
  FaUsers,
  FaUserCircle,
  FaUserFriends,
  FaLock,
  FaHome,
  FaCalendarAlt,
  FaUserInjured,
  FaMoneyBillWave,
  FaChartBar,
  FaUserCog,
  FaExchangeAlt,
} from 'react-icons/fa';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import { Button } from '@/components/ui/button';

const staffGuideData = [
  {
    title: 'Dashboard',
    icon: FaHome,
    path: '/dashboard/staff',
    content: [
      'Get a quick snapshot of your daily tasks, notifications, and essential hospital updates in one place.',
      'Access important alerts and reminders for your shift.'
    ]
  },
  {
    title: 'Appointments',
    icon: FaCalendarAlt,
    path: '/dashboard/staff/appointments',
    content: [
      'View upcoming appointments and manage bookings efficiently.',
      'Schedule new appointments and update existing ones.'
    ]
  },
  {
    title: 'Patients',
    icon: FaUserInjured,
    path: '/dashboard/staff/patient-list',
    content: [
      'Access patient profiles and add new entries.',
      'Monitor ongoing treatment records and update patient information.'
    ]
  },
  {
    title: 'Billing',
    icon: FaMoneyBillWave,
    path: '/dashboard/staff/billings',
    content: [
      'Review financial transactions and manage patient billing.',
      'Monitor income and expenses for your department.'
    ]
  },
  {
    title: 'Reports',
    icon: FaChartBar,
    path: '/dashboard/staff/reports',
    content: [
      'Generate hospital reports such as inventory usage and patient history logs.',
      'Check blood bank status and other key statistics.'
    ]
  },
  {
    title: 'Profile & Settings',
    icon: FaUserCog,
    path: '/dashboard/staff/profile',
    content: [
      'Edit your personal details and update login credentials.',
      'Set your availability preferences and notification settings.'
    ]
  },
  {
    title: 'Discharges & Transfer',
    icon: FaExchangeAlt,
    path: '/dashboard/staff/profile',
    content: [
      'Manage patient discharges and transfer requests.',
      'Coordinate with other departments for smooth transitions.'
    ]
  },
];

export default function StaffGuidePage() {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={staffSidebar}>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Staff Guide</h2>
        <Accordion type="multiple" className="space-y-4">
          {staffGuideData.map((step, index) => (
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
                {step.content.map((point, idx) => (
                  <p key={idx} className="text-base">• {point}</p>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
}
