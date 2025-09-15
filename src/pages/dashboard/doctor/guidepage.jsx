import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Layout from '../../../components/Layout';
import { doctorSidebar } from '../../../constants/sidebarItems/doctorSidebar';

import {
  FaChartLine,
  FaCalendarCheck,
  FaFileAlt,
  FaUserMd,
  FaUserFriends,
  FaUsers,
  FaUserCircle,
  FaLock,
} from 'react-icons/fa';
import { DepartmentIcon } from '@/components/common/Icons';

const doctorGuideData = [
  {
    title: 'Dashboard Overview',
    icon: FaChartLine,
    path: '/dashboard/doctor',
    content: [
      'Monitor patient metrics and schedules at a glance.',
      'Keep track of appointment volume, task updates, and key alerts.'
    ]
  },
  {
    title: 'Manage Appointments',
    icon: FaCalendarCheck,
    path: '/dashboard/doctor/appointments',
    content: [
      'Review all scheduled appointments with filtering options.',
      'Update or mark appointments as completed in real-time.'
    ]
  },
  {
    title: 'My Schedule',
    icon: FaFileAlt,
    path: '/dashboard/doctor/schedule',
    content: [
      'Check your shift timings, availability, and department allocations.',
      'Make adjustments or block time slots for emergencies or breaks.'
    ]
  },
  {
    title: 'Doctors Directory',
    icon: FaUserMd,
    path: '/dashboard/doctor/all-doctors',
    content: [
      'View and collaborate with fellow doctors across departments.',
      'Access profiles and contact information securely.'
    ]
  },
  {
    title: 'My Patients',
    icon: FaUserFriends,
    path: '/dashboard/doctor/patients',
    content: [
      'Access your assigned patient list with medical history and updates.',
      'Add prescriptions, notes, and recommendations after consultations.'
    ]
  },
  {
    title: 'My Department',
    icon: DepartmentIcon,
    path: '/dashboard/doctor/department',
    content: [
      'Review department structure and your responsibilities.',
      'Communicate with department HODs and staff efficiently.'
    ]
  },
  {
    title: 'Reports & Tests',
    icon: FaUsers,
    path: '/dashboard/doctor/reports',
    content: [
      'Review diagnostic reports, lab test results, and imaging.',
      'Download and annotate patient tests for clinical use.'
    ]
  },
  {
    title: 'Profile & Settings',
    icon: FaUserCircle,
    path: '/dashboard/doctor/profile',
    content: [
      'Update your professional profile, contact info, and availability.',
      'Set notification preferences and change passwords.'
    ]
  },
  {
    title: 'Forgot Password',
    icon: FaLock,
    path: '/forgot-password',
    content: [
      'Reset your login credentials in case of access issues.',
      'Follow secure steps to regain access to your doctor portal.'
    ]
  }
];

export default function DoctorGuide() {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={doctorSidebar} section = "Doctor">
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Doctor Portal Guide</h2>
        <Accordion type="multiple" className="space-y-4">
          {doctorGuideData.map((step, index) => (
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
