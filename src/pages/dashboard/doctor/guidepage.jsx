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
  FaStethoscope,
  FaClinicMedical,
  FaNotesMedical,
  FaChevronRight,
  FaBookMedical,
  FaBell,
  FaPrescription,
  FaExchangeAlt
} from 'react-icons/fa';
import { 
  Calendar,
  FileText,
  Users,
  Settings,
  Shield,
  Clock,
  BarChart3,
  HelpCircle,
  Zap,
  BookOpen,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { DepartmentIcon } from '@/components/common/Icons';

const doctorGuideData = [
  {
    title: 'Dashboard Overview',
    icon: FaChartLine,
    path: '/dashboard/doctor',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    iconColor: 'text-blue-600',
    priority: 'High',
    content: [
      'Monitor patient metrics and schedules at a glance with interactive charts',
      'Track appointment volume, task updates, and key alerts in real-time',
      'Access quick stats for today\'s patients, pending tasks, and revenue'
    ]
  },
  {
    title: 'Manage Appointments',
    icon: FaCalendarCheck,
    path: '/dashboard/doctor/appointments',
    color: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200',
    iconColor: 'text-teal-600',
    priority: 'High',
    content: [
      'Review all scheduled appointments with advanced filtering options',
      'Update appointment status or mark as completed in real-time',
      'Manage patient wait times and appointment rescheduling'
    ]
  },
  {
    title: 'Appointment Details',
    icon: Calendar,
    path: '/dashboard/doctor/appointments',
    color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
    iconColor: 'text-emerald-600',
    priority: 'High',
    content: [
      'View detailed information about specific appointments',
      'Access patient history and previous consultations',
      'Start consultation and write prescriptions for the patient'
    ]
  },
  {
    title: 'My Schedule',
    icon: Calendar,
    path: '/dashboard/doctor/schedule',
    color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    iconColor: 'text-purple-600',
    priority: 'Medium',
    content: [
      'Check your shift timings, availability, and department allocations',
      'Make adjustments or block time slots for emergencies or breaks',
      'Sync schedule with hospital calendar and set recurring availability'
    ]
  },
  {
    title: 'Patient Discharge',
    icon: FaExchangeAlt,
    path: '/dashboard/doctor/patients',
    color: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
    iconColor: 'text-amber-600',
    priority: 'Medium',
    content: [
      'Review patient records and prepare discharge summaries',
      'Coordinate with staff for patient discharge procedures',
      'Provide follow-up instructions and medication plans'
    ]
  },
  {
    title: 'My Patients',
    icon: FaUserFriends,
    path: '/dashboard/doctor/patients',
    color: 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200',
    iconColor: 'text-rose-600',
    priority: 'High',
    content: [
      'Access your assigned patient list with complete medical history',
      'Review patient billing information and payment status',
      'Track patient progress and follow-up appointment schedules'
    ]
  },
  {
    title: 'Salary & Payments',
    icon: DollarSign,
    path: '/dashboard/doctor/salary',
    color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    iconColor: 'text-green-600',
    priority: 'Medium',
    content: [
      'View salary details, payment history, and payslips',
      'Check consultation fees and additional earnings',
      'Track pending payments and reimbursement claims'
    ]
  },
  {
    title: 'Patient Reports',
    icon: FileText,
    path: '/dashboard/doctor/reports',
    color: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
    iconColor: 'text-slate-600',
    priority: 'High',
    content: [
      'Review diagnostic reports, lab test results, and imaging studies',
      'Download and annotate patient tests for clinical use',
      'Compare historical test results and track patient progress'
    ]
  },
  {
    title: 'My Department',
    icon: DepartmentIcon,
    path: '/dashboard/doctor/department',
    color: 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200',
    iconColor: 'text-violet-600',
    priority: 'Medium',
    content: [
      'Review department structure, staff, and your responsibilities',
      'Communicate with department HODs and staff efficiently',
      'Access department-specific resources and protocols'
    ]
  },
  {
    title: 'Profile & Settings',
    icon: Settings,
    path: '/dashboard/doctor/profile',
    color: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
    iconColor: 'text-gray-600',
    priority: 'Medium',
    content: [
      'Update your professional profile, contact info, and availability',
      'Set notification preferences, working hours, and consultation fees',
      'Manage digital signature and professional certifications'
    ]
  },
  {
    title: 'Security & Access',
    icon: Shield,
    path: '/dashboard/doctor/security',
    color: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
    iconColor: 'text-red-600',
    priority: 'Low',
    content: [
      'Reset login credentials in case of access issues',
      'Enable two-factor authentication for enhanced security',
      'Review login history and active sessions'
    ]
  }
];

export default function DoctorGuide() {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={doctorSidebar} section="Doctor">
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-3xl mb-6 shadow-lg">
            <FaStethoscope className="w-10 h-10 text-teal-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Doctor Portal Guide
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Comprehensive guide to managing your clinical practice efficiently
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div 
            onClick={() => navigate('/dashboard/doctor/appointments')}
            className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <FaCalendarCheck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-teal-800">Appointments</h3>
                <p className="text-sm text-teal-600 font-medium">Manage patient schedule</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/doctor/patients')}
            className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <FaUserFriends className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-800">My Patients</h3>
                <p className="text-sm text-indigo-600 font-medium">Patient records & history</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/doctor/schedule')}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-800">My Schedule</h3>
                <p className="text-sm text-emerald-600 font-medium">Working hours & shifts</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/doctor/reports')}
            className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-2xl border border-rose-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-rose-800">Reports</h3>
                <p className="text-sm text-rose-600 font-medium">Lab results & diagnostics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Guide Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Step-by-Step Guide</h2>
                  <p className="text-slate-500 text-sm">Click on any section to expand details</p>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {doctorGuideData.length} modules
              </div>
            </div>
          </div>
          
          <Accordion type="multiple" className="divide-y divide-slate-100">
            {doctorGuideData.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="px-6 transition-all duration-200 hover:bg-slate-50/50"
                >
                  <AccordionTrigger className="py-5 font-semibold text-slate-800 hover:text-slate-900 hover:no-underline">
                    <div className="flex justify-between w-full items-center gap-4">
                      <div className="flex items-center gap-4 w-full">
                        <div className={`p-3 rounded-xl ${step.color.split(' ')[0]} border ${step.color.split(' ')[3]}`}>
                          <IconComponent className={`w-5 h-5 ${step.iconColor}`} />
                        </div>
                        <div className="text-left">
                          <span className="text-base font-semibold">{step.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-slate-500">
                              {step.content.length} key points
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                              Module {index + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 transition-all hover:-translate-y-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(step.path);
                          }}
                        >
                          Go Now <FaChevronRight className="ml-1 w-3 h-3" />
                        </Button>
                        <FaChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2 text-slate-700">
                    <div className={`${step.color} rounded-xl p-5`}>
                      <div className="space-y-4">
                        {step.content.map((point, idx) => (
                          <div key={idx} className="flex items-start group">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform">
                              <span className="text-xs font-bold text-slate-600">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-800">{point}</p>
                              {idx < step.content.length - 1 && (
                                <div className="h-4 border-l border-dashed border-slate-300 ml-3 mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => navigate(step.path)}
                          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3 py-2 rounded-lg transition-colors w-full justify-center"
                        >
                          <Zap className="w-4 h-4" />
                          Start working with {step.title}
                        </button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Quick Tips & Support Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Tips Section */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-sm border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <FaClinicMedical className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-lg">Clinical Best Practices</h3>
                <p className="text-amber-600 text-sm">Essential guidelines for doctors</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FaNotesMedical className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Patient Documentation</h4>
                    <p className="text-amber-700 text-xs">Always update patient records immediately after consultations</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FaBell className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Appointment Management</h4>
                    <p className="text-amber-700 text-xs">Review next day's appointments each evening for preparation</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FaBookMedical className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Prescription Safety</h4>
                    <p className="text-amber-700 text-xs">Double-check drug interactions before prescribing medications</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Follow-up Protocol</h4>
                    <p className="text-amber-700 text-xs">Schedule automatic follow-up reminders for critical cases</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support & Resources Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <HelpCircle className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Support & Emergency</h3>
                <p className="text-slate-600 text-sm">Get help when you need it</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <Shield className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Emergency Access</h4>
                      <p className="text-slate-500 text-xs">System issues during critical hours</p>
                    </div>
                  </div>
                  <FaChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">IT Support</h4>
                      <p className="text-slate-500 text-xs">Technical assistance and training</p>
                    </div>
                  </div>
                  <FaChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Training Resources</h4>
                      <p className="text-slate-500 text-xs">Video tutorials and guides</p>
                    </div>
                  </div>
                  <FaChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <p className="text-slate-600 text-sm mb-3">
                For urgent assistance, contact hospital IT at{' '}
                <span className="font-semibold text-teal-600">ext. 5555</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>24/7 emergency support available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg">
            <FaStethoscope className="w-5 h-5" />
            <div>
              <p className="font-semibold">Ready to manage your clinical practice?</p>
              <p className="text-sm opacity-90">Start by exploring any module above</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}