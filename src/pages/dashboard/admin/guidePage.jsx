
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { DollarSign, PercentCircle, FileText, Users, Building2, UserPlus, CalendarClock, Stethoscope, FilePlus2 } from 'lucide-react';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar'; 

const guideData = [
  {
    title: 'Department Setup',
    icon: Building2,
    path: '/dashboard/admin/add-department',
    content: [
      'Create Departments: Start by adding departments such as Cardiology, Orthopedics, etc., under the "Add Department" section.',
      'Review Department List: Verify the department list to ensure all required departments are created before proceeding.'
    ]
  },
  {
    title: 'Add Doctors',
    icon: Stethoscope,
    path: '/dashboard/admin/add-doctor',
    content: [
      'Register Doctors: Use the "Add Doctor" form to input essential details including specialization, department, availability, and contact information.',
      'Verify Doctor List: Ensure that all doctors are listed correctly under the "Doctor List" section. Edit profiles as necessary.'
    ]
  },
  {
    title: 'Assign HODs (Head of Departments)',
    icon: UserPlus,
    path: '/dashboard/admin/add-hod-main',
    content: [
      'Set HOD for Each Department: Assign one doctor as the Head of Department (HOD) through the "Add HOD" or department management section.',
      'Role Management: HODs may have elevated access rights depending on system configuration. Ensure correct assignment.'
    ]
  },
  {
    title: 'Add Supporting Staff',
    icon: Users,
    path: '/dashboard/admin/add-staff',
    content: [
      'Register Non-Doctor Staff: Add nurses, wardboys, lab technicians, pharmacists, and other staff members through the "Add Staff" form.',
      'Department Assignment: Link each staff member to their respective department for organizational clarity.'
    ]
  },
  {
    title: 'Patient Registration',
    icon: FilePlus2,
    path: '/dashboard/admin/add-patient',
    content: [
      'Add Patient Details: Admit new patients using either the "Add Patient OPD" or "Add Patient IPD" Forms depending on their treatment type.',
      'Capture Medical Information: Record patient history, allergies, emergency contacts, and assign ward/bed numbers where applicable.'
    ]
  },
  {
    title: 'Doctor Appointment',
    icon: CalendarClock,
    path: '/dashboard/admin/appointments',
    content: [
      'Assign Doctors to Patients: Schedule appointments by assigning a doctor to each patient through the "Appointments" section.',
      'Manage Appointment List: Regularly review and update appointments to reflect changes in doctor availability or patient needs.'
    ]
  },
  {
    title: 'Pharmacy and Billing Management',
    icon: FileText,
    path: '/dashboard/admin/pharmacies/add',
    content: [
      'Pharmacy Setup: Add available medicines, manage stock, and handle pharmacy-related transactions under the "Pharmacy" section.',
      'Generate Bills & Invoices: Record expenses, generate patient bills, and maintain financial records through the "Finance" section.'
    ]
  },
  {
    title: 'Charges and Discounts',
    icon: PercentCircle,
    path: '/dashboard/admin/profile',
    content: [
      'Fix charges like consultation fees, OPD/IPD registration, etc.',
      'Apply discount rules for special cases or packages from the profile tab.'
    ]
  }
];

export default function AdminGuide() {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={adminSidebar}>
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Hospital Setup Guide</h2>
      <Accordion type="multiple" className="space-y-4">
        {guideData.map((step, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="rounded-xl border border-teal-200 shadow-sm">
            <AccordionTrigger className="p-4 font-semibold text-lg text-teal-900 hover:text-teal-600">
              <div className="flex justify-between w-full items-center gap-3">
                <div className='flex items-center gap-5 w-full text-nowrap'>
                <step.icon className="text-teal-600 w-10 h-10" />
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
