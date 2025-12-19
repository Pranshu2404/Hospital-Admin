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
  FaChevronRight,
  FaTasks,
  FaHospital,
  FaClipboardCheck,
  FaBell,
  FaUserShield,
  FaCogs,
  FaBed,
  FaFileInvoiceDollar,
  FaClipboardList
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
  Clipboard,
  Wallet,
  Bell,
  Activity
} from 'lucide-react';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { staffSidebar } from '@/constants/sidebarItems/staffSidebar';
import { Button } from '@/components/ui/button';

const staffGuideData = [
  {
    title: 'Dashboard Overview',
    icon: FaHome,
    path: '/dashboard/staff',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    iconColor: 'text-blue-600',
    content: [
      'Get a quick snapshot of your daily tasks, notifications, and essential hospital updates',
      'Access important alerts and reminders for your shift with priority indicators',
      'View team schedules and department announcements in real-time'
    ]
  },
  {
    title: 'Appointment Management',
    icon: FaCalendarAlt,
    path: '/dashboard/staff/appointments',
    color: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200',
    iconColor: 'text-teal-600',
    content: [
      'View upcoming appointments and manage bookings efficiently with color-coded status',
      'Schedule new appointments and update existing ones with automatic conflict detection',
      'Handle walk-in patients and emergency bookings with priority queuing'
    ]
  },
  {
    title: 'Patient Management',
    icon: FaUserInjured,
    path: '/dashboard/staff/patient-list',
    color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
    iconColor: 'text-emerald-600',
    content: [
      'Access complete patient profiles with medical history and treatment records',
      'Register new patients with automatic ID generation and insurance verification',
      'Update patient information, add notes, and track admission status'
    ]
  },
  {
    title: 'Billing & Payments',
    icon: FaMoneyBillWave,
    path: '/dashboard/staff/billing',
    color: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
    iconColor: 'text-amber-600',
    content: [
      'Review financial transactions and manage patient billing with detailed breakdowns',
      'Monitor department income and expenses with real-time reporting',
      'Process payments, generate receipts, and manage insurance claims'
    ]
  },
  {
    title: 'Reports & Analytics',
    icon: FaChartBar,
    path: '/dashboard/staff/reports',
    color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    iconColor: 'text-purple-600',
    content: [
      'Generate comprehensive hospital reports including inventory usage and patient history',
      'Check blood bank status, bed occupancy, and other key departmental statistics',
      'Export reports in multiple formats for meetings and compliance requirements'
    ]
  },
  {
    title: 'Profile & Settings',
    icon: FaUserCog,
    path: '/dashboard/staff/profile',
    color: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
    iconColor: 'text-slate-600',
    content: [
      'Edit personal details, emergency contacts, and professional information',
      'Update login credentials and enable two-factor authentication',
      'Set availability preferences, notification settings, and shift preferences'
    ]
  },
  {
    title: 'Discharges & Transfers',
    icon: FaExchangeAlt,
    path: '/dashboard/staff/discharges',
    color: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200',
    iconColor: 'text-indigo-600',
    content: [
      'Manage patient discharges with automatic billing settlement and documentation',
      'Coordinate inter-department transfers with real-time bed availability checks',
      'Generate discharge summaries and follow-up appointment scheduling'
    ]
  },
  {
    title: 'Task Management',
    icon: FaTasks,
    path: '/dashboard/staff/tasks',
    color: 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200',
    iconColor: 'text-rose-600',
    content: [
      'Track daily assignments and responsibilities with priority levels',
      'Receive task assignments from supervisors with deadlines and instructions',
      'Update task status and request assistance when needed'
    ]
  }
];

export default function StaffGuidePage() {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={staffSidebar} section={'Staff'}>
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-3xl mb-6 shadow-lg">
            <FaHospital className="w-10 h-10 text-teal-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Hospital Staff Guide
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Comprehensive guide for hospital staff operations and workflows
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div 
            onClick={() => navigate('/dashboard/staff/appointments')}
            className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <FaCalendarAlt className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-teal-800">Appointments</h3>
                <p className="text-sm text-teal-600 font-medium">Manage patient schedule</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/staff/patient-list')}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <FaUserInjured className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-800">Patients</h3>
                <p className="text-sm text-emerald-600 font-medium">Patient records & care</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/staff/billing')}
            className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <FaMoneyBillWave className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800">Billing</h3>
                <p className="text-sm text-amber-600 font-medium">Financial management</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/staff/tasks')}
            className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-2xl border border-rose-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <FaTasks className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-rose-800">Tasks</h3>
                <p className="text-sm text-rose-600 font-medium">Daily assignments</p>
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
                  <h2 className="text-lg font-bold text-slate-800">Staff Operations Guide</h2>
                  <p className="text-slate-500 text-sm">Click on any section to expand details</p>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {staffGuideData.length} modules
              </div>
            </div>
          </div>
          
          <Accordion type="multiple" className="divide-y divide-slate-100">
            {staffGuideData.map((step, index) => {
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
                <FaClipboardCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-lg">Staff Best Practices</h3>
                <p className="text-amber-600 text-sm">Essential guidelines for hospital staff</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FaCalendarAlt className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Appointment Management</h4>
                    <p className="text-amber-700 text-xs">Always confirm next day appointments with patients before closing</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FaFileInvoiceDollar className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Billing Accuracy</h4>
                    <p className="text-amber-700 text-xs">Double-check insurance details and co-payments before processing bills</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FaClipboardList className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Patient Registration</h4>
                    <p className="text-amber-700 text-xs">Verify all patient documents and emergency contacts during registration</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FaBell className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Shift Handover</h4>
                    <p className="text-amber-700 text-xs">Complete all pending tasks and update handover notes before shift end</p>
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
                <h3 className="font-bold text-slate-800 text-lg">Support & Resources</h3>
                <p className="text-slate-600 text-sm">Get help and access training materials</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <FaUserShield className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Emergency Protocols</h4>
                      <p className="text-slate-500 text-xs">Critical situations and procedures</p>
                    </div>
                  </div>
                  <FaChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FaCogs className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">System Training</h4>
                      <p className="text-slate-500 text-xs">Software tutorials and guides</p>
                    </div>
                  </div>
                  <FaChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Performance Tools</h4>
                      <p className="text-slate-500 text-xs">Efficiency and productivity resources</p>
                    </div>
                  </div>
                  <FaChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <p className="text-slate-600 text-sm mb-3">
                For immediate assistance, contact hospital admin at{' '}
                <span className="font-semibold text-teal-600">ext. 2222</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>24/7 technical support available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Contacts */}
        <div className="mt-8 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-sm border border-indigo-200 p-6">
          <h3 className="font-bold text-indigo-800 text-lg mb-4">📞 Important Contacts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 p-4 rounded-xl border border-indigo-100">
              <h4 className="font-semibold text-indigo-900 text-sm mb-1">Emergency Services</h4>
              <p className="text-indigo-700 text-xs">Ext. 1000 • 24/7 Available</p>
            </div>
            <div className="bg-white/70 p-4 rounded-xl border border-indigo-100">
              <h4 className="font-semibold text-indigo-900 text-sm mb-1">IT Support</h4>
              <p className="text-indigo-700 text-xs">Ext. 5555 • 7 AM - 10 PM</p>
            </div>
            <div className="bg-white/70 p-4 rounded-xl border border-indigo-100">
              <h4 className="font-semibold text-indigo-900 text-sm mb-1">Admin Office</h4>
              <p className="text-indigo-700 text-xs">Ext. 2222 • 9 AM - 6 PM</p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg">
            <FaHospital className="w-5 h-5" />
            <div>
              <p className="font-semibold">Ready to manage hospital operations?</p>
              <p className="text-sm opacity-90">Start by exploring any module above</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}