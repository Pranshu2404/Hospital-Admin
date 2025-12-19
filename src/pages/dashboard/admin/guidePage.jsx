import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  PercentCircle, 
  FileText, 
  Users, 
  Building2, 
  UserPlus, 
  CalendarClock, 
  Stethoscope, 
  FilePlus2, 
  ChevronRight,
  Settings,
  BookOpen,
  Shield,
  Zap,
  Hospital,
  UserCheck,
  ClipboardCheck,
  PieChart,
  Bed,
  Pill,
  Bell,
  HelpCircle,
  Activity,
  TrendingUp,
  Lock
} from 'lucide-react';
import Layout from '../../../components/Layout';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { FaUserMd, FaHospital, FaUserTie, FaUserNurse, FaFileMedical, FaCalendarAlt } from 'react-icons/fa';

const guideData = [
  {
    title: 'Department Setup',
    icon: Building2,
    path: '/dashboard/admin/add-department',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    iconColor: 'text-blue-600',
    priority: 'High',
    content: [
      'Create departments like Cardiology, Orthopedics, Pediatrics, etc., with detailed descriptions and service offerings',
      'Configure department settings including consultation hours, emergency services, and specialty flags',
      'Assign physical locations, rooms, and resources to each department for facility management'
    ]
  },
  {
    title: 'Doctor Management',
    icon: Stethoscope,
    path: '/dashboard/admin/add-doctor',
    color: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200',
    iconColor: 'text-teal-600',
    priority: 'High',
    content: [
      'Register doctors with complete professional profiles including specialization, qualifications, and experience',
      'Set up doctor schedules, consultation fees, and availability patterns',
      'Manage doctor credentials, digital signatures, and prescription privileges'
    ]
  },
  {
    title: 'HOD Assignments',
    icon: UserCheck,
    path: '/dashboard/admin/add-hod-main',
    color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    iconColor: 'text-purple-600',
    priority: 'Medium',
    content: [
      'Assign Head of Department roles with elevated administrative privileges',
      'Configure HOD responsibilities including staff management and department oversight',
      'Set up reporting structures and approval workflows for departmental decisions'
    ]
  },
  {
    title: 'Staff Management',
    icon: Users,
    path: '/dashboard/admin/add-staff',
    color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
    iconColor: 'text-emerald-600',
    priority: 'High',
    content: [
      'Register nurses, technicians, pharmacists, and administrative staff with role-based access',
      'Assign staff to departments and configure shift patterns and working hours',
      'Manage staff credentials, training records, and performance metrics'
    ]
  },
  {
    title: 'Patient Registration',
    icon: FilePlus2,
    path: '/dashboard/admin/add-patient',
    color: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200',
    iconColor: 'text-indigo-600',
    priority: 'High',
    content: [
      'Register OPD and IPD patients with comprehensive medical and demographic information',
      'Capture medical history, allergies, insurance details, and emergency contacts',
      'Assign beds, wards, and allocate resources based on patient requirements'
    ]
  },
  {
    title: 'Appointment Scheduling',
    icon: CalendarClock,
    path: '/dashboard/admin/appointments',
    color: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
    iconColor: 'text-amber-600',
    priority: 'Medium',
    content: [
      'Schedule appointments with automated conflict detection and doctor availability checks',
      'Configure appointment types (consultation, follow-up, emergency) with different durations',
      'Manage appointment reminders, cancellations, and rescheduling workflows'
    ]
  },
  {
    title: 'Pharmacy & Inventory',
    icon: Pill,
    path: '/dashboard/admin/pharmacies/add',
    color: 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200',
    iconColor: 'text-rose-600',
    priority: 'Medium',
    content: [
      'Set up pharmacy inventory with medicine categories, suppliers, and pricing',
      'Configure stock alerts, expiry management, and batch tracking systems',
      'Manage pharmacy billing, insurance claims, and prescription workflows'
    ]
  },
  {
    title: 'Financial Configuration',
    icon: DollarSign,
    path: '/dashboard/admin/finance/settings',
    color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    iconColor: 'text-green-600',
    priority: 'High',
    content: [
      'Configure consultation fees, procedure charges, and room tariffs',
      'Set up insurance provider integrations and claim processing rules',
      'Establish discount policies, package deals, and promotional offers'
    ]
  },
  {
    title: 'System Settings',
    icon: Settings,
    path: '/dashboard/admin/settings/general',
    color: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
    iconColor: 'text-slate-600',
    priority: 'Medium',
    content: [
      'Configure hospital information, branches, and contact details',
      'Set up user roles, permissions, and access control policies',
      'Manage system preferences, notifications, and integration settings'
    ]
  },
  {
    title: 'Security & Compliance',
    icon: Shield,
    path: '/dashboard/admin/security',
    color: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
    iconColor: 'text-red-600',
    priority: 'High',
    content: [
      'Configure data privacy settings and patient confidentiality protocols',
      'Set up audit trails, access logs, and compliance reporting',
      'Establish backup procedures and disaster recovery plans'
    ]
  }
];

export default function AdminGuide() {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={adminSidebar}>
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-3xl mb-6 shadow-lg">
            <Hospital className="w-10 h-10 text-teal-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Hospital Administration Guide
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Complete setup and management guide for hospital administrators
          </p>
        </div>

        {/* Setup Progress Overview */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-sm border border-slate-200 p-6 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <ClipboardCheck className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Setup Progress</h2>
                <p className="text-slate-500 text-sm">Track your hospital configuration progress</p>
              </div>
            </div>
            <div className="text-sm font-semibold text-teal-600">
              {guideData.filter(g => g.priority === 'High').length} critical steps remaining
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              onClick={() => navigate('/dashboard/admin/add-department')}
              className="bg-white p-4 rounded-xl border border-blue-200 cursor-pointer hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-full">Step 1</span>
              </div>
              <h4 className="font-semibold text-slate-800 text-sm">Departments</h4>
              <p className="text-xs text-slate-500">Setup all hospital departments</p>
            </div>
            
            <div 
              onClick={() => navigate('/dashboard/admin/add-doctor')}
              className="bg-white p-4 rounded-xl border border-teal-200 cursor-pointer hover:border-teal-300 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-semibold px-2 py-1 bg-teal-50 text-teal-600 rounded-full">Step 2</span>
              </div>
              <h4 className="font-semibold text-slate-800 text-sm">Doctors</h4>
              <p className="text-xs text-slate-500">Register medical staff</p>
            </div>
            
            <div 
              onClick={() => navigate('/dashboard/admin/add-staff')}
              className="bg-white p-4 rounded-xl border border-emerald-200 cursor-pointer hover:border-emerald-300 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">Step 3</span>
              </div>
              <h4 className="font-semibold text-slate-800 text-sm">Support Staff</h4>
              <p className="text-xs text-slate-500">Add nurses & technicians</p>
            </div>
            
            <div 
              onClick={() => navigate('/dashboard/admin/finance/settings')}
              className="bg-white p-4 rounded-xl border border-green-200 cursor-pointer hover:border-green-300 transition-colors group"
            >
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-xs font-semibold px-2 py-1 bg-green-50 text-green-600 rounded-full">Step 4</span>
              </div>
              <h4 className="font-semibold text-slate-800 text-sm">Finance Setup</h4>
              <p className="text-xs text-slate-500">Configure billing & charges</p>
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
                  <h2 className="text-lg font-bold text-slate-800">Complete Setup Guide</h2>
                  <p className="text-slate-500 text-sm">Follow these steps to configure your hospital system</p>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {guideData.length} modules • Priority-based order
              </div>
            </div>
          </div>
          
          <Accordion type="multiple" className="divide-y divide-slate-100">
            {guideData.map((step, index) => {
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
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold">{step.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              step.priority === 'High' 
                                ? 'bg-red-50 text-red-600 border border-red-100' 
                                : step.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-slate-50 text-slate-600 border border-slate-100'
                            }`}>
                              {step.priority} Priority
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-slate-500">
                              {step.content.length} configuration steps
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                              Step {index + 1}
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
                          Configure <ChevronRight className="ml-1 w-3 h-3" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
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
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500">
                            Estimated setup time: {step.priority === 'High' ? '15-30 minutes' : '5-15 minutes'}
                          </span>
                          <button
                            onClick={() => navigate(step.path)}
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white px-3 py-2 rounded-lg transition-colors"
                          >
                            <Zap className="w-4 h-4" />
                            Start {step.title} Setup
                          </button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Quick Tips & Best Practices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Best Practices Section */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-sm border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-lg">Admin Best Practices</h3>
                <p className="text-amber-600 text-sm">Essential guidelines for hospital administrators</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <Lock className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Security First</h4>
                    <p className="text-amber-700 text-xs">Configure user permissions and access controls before adding staff</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <Bed className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Resource Planning</h4>
                    <p className="text-amber-700 text-xs">Setup departments and bed allocations before admitting patients</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FaUserTie className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Staff Hierarchy</h4>
                    <p className="text-amber-700 text-xs">Establish clear reporting structures by assigning HODs early</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <Bell className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Testing Workflows</h4>
                    <p className="text-amber-700 text-xs">Test appointment scheduling and billing before going live</p>
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
                <p className="text-slate-600 text-sm">Get help with hospital setup and management</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Setup Checklist</h4>
                      <p className="text-slate-500 text-xs">Complete configuration checklist</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Training Videos</h4>
                      <p className="text-slate-500 text-xs">Step-by-step video tutorials</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <PieChart className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Compliance Guide</h4>
                      <p className="text-slate-500 text-xs">Regulatory requirements</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200">
              <p className="text-slate-600 text-sm mb-3">
                For technical support, contact system administrators at{' '}
                <span className="font-semibold text-teal-600">support@hospital.com</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Priority support for administrators: 24/7 available</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status & Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 p-6">
            <h3 className="font-bold text-blue-800 text-sm mb-3">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Setup Progress</span>
                <span className="text-sm font-semibold text-blue-800">65%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl shadow-sm border border-teal-200 p-6">
            <h3 className="font-bold text-teal-800 text-sm mb-3">Quick Actions</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/dashboard/admin/settings/general')}
                className="flex-1 bg-white text-teal-700 text-xs font-semibold px-3 py-2 rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors"
              >
                Settings
              </button>
              <button 
                onClick={() => navigate('/dashboard/admin/reports')}
                className="flex-1 bg-white text-teal-700 text-xs font-semibold px-3 py-2 rounded-lg border border-teal-200 hover:bg-teal-50 transition-colors"
              >
                Reports
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-sm border border-emerald-200 p-6">
            <h3 className="font-bold text-emerald-800 text-sm mb-3">Next Steps</h3>
            <button 
              onClick={() => navigate('/dashboard/admin/security')}
              className="w-full bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Configure Security Settings
            </button>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg">
            <Hospital className="w-5 h-5" />
            <div>
              <p className="font-semibold">Ready to configure your hospital system?</p>
              <p className="text-sm opacity-90">Start with high priority modules first</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}