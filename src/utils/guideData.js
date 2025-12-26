import { DepartmentIcon } from "@/components/common/Icons";
import { BarChart3, Building2, Calendar, CalendarClock, DollarSign, FilePlus2, FileText, Pill, PillIcon, ReceiptIcon, RefreshCw, Settings, Shield, ShoppingCartIcon, Stethoscope, UserCheck, Users } from "lucide-react";
import { FaCalendarAlt, FaCalendarCheck, FaChartBar, FaChartLine, FaExchangeAlt, FaHome, FaMoneyBillWave, FaPrescription, FaTasks, FaUserCog, FaUserFriends, FaUserInjured, FaUserMd } from "react-icons/fa";

const adminGuideData = [
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
    title: 'Room Management',
    icon: Building2,
    path: '/dashboard/admin/add-room',
    color: 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200',
    iconColor: 'text-cyan-600',
    priority: 'High',
    content: [
      'Create rooms and assign them to departments for inpatient services',
      'Configure room types (General Ward, ICU, Private Room) with different tariffs',
      'Manage bed allocation and room availability status'
    ]
  },
  {
    title: 'Financial Configuration',
    icon: DollarSign,
    path: '/dashboard/admin/profile',
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
    priority: 'High',
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
    title: 'Registrar Appointment',
    icon: UserCheck,
    path: '/dashboard/admin/add-registrar',
    color: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
    iconColor: 'text-orange-600',
    priority: 'Medium',
    content: [
      'Appoint registrars for patient admissions and discharge processes',
      'Configure registrar access permissions and responsibilities',
      'Set up registrar schedules and duty rosters'
    ]
  },
  {
    title: 'Pharmacy Setup',
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
    title: 'IPD Appointments',
    icon: CalendarClock,
    path: '/dashboard/admin/ipd-appointments',
    color: 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200',
    iconColor: 'text-violet-600',
    priority: 'Medium',
    content: [
      'Schedule inpatient department appointments and admissions',
      'Manage bed allocation and room assignments for IPD patients',
      'Coordinate with departments for inpatient care scheduling'
    ]
  },
  {
    title: 'System Settings',
    icon: Settings,
    path: '/dashboard/admin/settings',
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
    path: '/dashboard/admin/profile',
    color: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
    iconColor: 'text-red-600',
    priority: 'High',
    content: [
      'Configure data privacy settings and patient confidentiality protocols',
      'Set up audit trails, access logs, and compliance reporting',
      'Establish backup procedures and disaster recovery plans'
    ]
  },
  {
    title: 'Salary Management',
    icon: DollarSign,
    path: '/dashboard/admin/finance/salary',
    color: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200',
    iconColor: 'text-yellow-600',
    priority: 'Medium',
    content: [
      'Manage salary structures for doctors, staff, and other employees',
      'Process monthly salary payments and generate payslips',
      'Track salary expenses and generate payroll reports'
    ]
  }
];

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
  }
];

const pharmacyGuideData = [
  {
    title: 'Dashboard Overview',
    icon: FaChartLine,
    path: '/dashboard/pharmacy',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    iconColor: 'text-blue-600',
    priority: 'High',
    content: [
      'Check expired medicines alert and low stock notifications',
      'Monitor prescriptions queue for pending dispensing',
      'View daily sales summary and inventory status'
    ]
  },
  {
    title: 'Inventory Management',
    icon: PillIcon,
    path: '/dashboard/pharmacy/medicine-list',
    color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
    iconColor: 'text-emerald-600',
    priority: 'High',
    content: [
      'Add new medicines with details like name, category, dosage, and pricing',
      'View all medicines with stock levels and expiry dates',
      'Check "Low Stock Alert" for items needing restocking and "Expired Medicines" for disposal'
    ]
  },
  {
    title: 'Suppliers Management',
    icon: ShoppingCartIcon,
    path: '/dashboard/pharmacy/suppliers',
    color: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200',
    iconColor: 'text-teal-600',
    priority: 'High',
    content: [
      'Add new suppliers with contact and contract details',
      'Manage supplier profiles and payment terms',
      'Track supplier performance and order history'
    ]
  },
  {
    title: 'Purchase Orders',
    icon: ShoppingCartIcon,
    path: '/dashboard/pharmacy/orders',
    color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    iconColor: 'text-purple-600',
    priority: 'High',
    content: [
      'Create purchase orders for new stock with automatic invoice generation',
      'Track order status from "Ordered" to "Received" with full audit trail',
      'Manage pending orders and reorder points'
    ]
  },
  {
    title: 'Receive Orders',
    icon: RefreshCw,
    path: '/dashboard/pharmacy/receive-stock',
    color: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200',
    iconColor: 'text-indigo-600',
    priority: 'High',
    content: [
      'Receive stock when orders arrive and update inventory',
      'Verify delivered items against purchase orders',
      'Update batch numbers and expiry dates for received medicines'
    ]
  },
  {
    title: 'Point of Sale',
    icon: ReceiptIcon,
    path: '/dashboard/pharmacy/pos',
    color: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
    iconColor: 'text-amber-600',
    priority: 'High',
    content: [
      'Process quick customer transactions with real-time stock updates',
      'Generate automatic invoices for walk-in customers',
      'Handle returns and exchanges through the sales system'
    ]
  },
  {
    title: 'Prescriptions Queue',
    icon: FaPrescription,
    path: '/dashboard/pharmacy/prescriptions/queue',
    color: 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200',
    iconColor: 'text-rose-600',
    priority: 'High',
    content: [
      'Check pending prescriptions awaiting dispensing',
      'Process prescriptions and update stock automatically',
      'Track prescription status from "Active" to "Completed" or "Expired"'
    ]
  },
  {
    title: 'Dispense Medications',
    icon: FaPrescription,
    path: '/dashboard/pharmacy/prescriptions/dispense',
    color: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200',
    iconColor: 'text-pink-600',
    priority: 'High',
    content: [
      'Dispense medications from doctor prescriptions',
      'Update patient medication records',
      'Provide medication instructions and warnings'
    ]
  },
  {
    title: 'Inventory Overview',
    icon: BarChart3,
    path: '/dashboard/pharmacy/inventory/overview',
    color: 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200',
    iconColor: 'text-cyan-600',
    priority: 'Medium',
    content: [
      'View complete inventory status with stock levels',
      'Check expired medicines and plan for disposal',
      'Monitor stock turnover and inventory valuation'
    ]
  },
  {
    title: 'Expired Stocks',
    icon: Shield,
    path: '/dashboard/pharmacy/expired',
    color: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
    iconColor: 'text-red-600',
    priority: 'High',
    content: [
      'Identify and remove expired medicines from inventory',
      'Generate expired stock reports for compliance',
      'Process expired medicine disposal with proper documentation'
    ]
  },
  {
    title: 'Sales History',
    icon: ReceiptIcon,
    path: '/dashboard/pharmacy/history',
    color: 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200',
    iconColor: 'text-violet-600',
    priority: 'Medium',
    content: [
      'Analyze daily, weekly, and monthly revenue trends',
      'View product performance and sales patterns',
      'Generate sales reports for management review'
    ]
  },
  {
    title: 'Billing & Invoicing',
    icon: FileText,
    path: '/dashboard/pharmacy/invoices',
    color: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
    iconColor: 'text-orange-600',
    priority: 'Medium',
    content: [
      'Generate invoices for sales, appointments, and purchase orders',
      'Track payment status with "Paid", "Pending", and "Overdue" filters',
      'View complete financial audit trail for all transactions'
    ]
  },
  {
    title: 'Payment Collection',
    icon: DollarSign,
    path: '/dashboard/pharmacy/billing/payments',
    color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    iconColor: 'text-green-600',
    priority: 'Medium',
    content: [
      'Record cash, card, and digital payments from customers',
      'Process insurance claims and third-party payments',
      'Generate payment receipts and acknowledgments'
    ]
  },
  {
    title: 'Quality & Compliance',
    icon: Shield,
    path: '/dashboard/pharmacy/batches',
    color: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
    iconColor: 'text-gray-600',
    priority: 'Low',
    content: [
      'Maintain medicine quality records with batch tracking',
      'Ensure regulatory compliance with expiry date management',
      'Generate compliance reports for regulatory requirements'
    ]
  }
];

const staffGuideData = [
  {
    title: 'Dashboard Overview',
    icon: FaHome,
    path: '/dashboard/staff',
    color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    iconColor: 'text-blue-600',
    priority: 'High',
    content: [
      'Check upcoming scheduled appointments for the day',
      'View important alerts and reminders for your shift',
      'Access team schedules and department announcements'
    ]
  },
  {
    title: 'Patient Registration',
    icon: FaUserInjured,
    path: '/dashboard/staff/add-patient',
    color: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200',
    iconColor: 'text-teal-600',
    priority: 'High',
    content: [
      'Register new OPD and IPD patients with comprehensive information',
      'Capture medical history, allergies, and insurance details',
      'Generate patient IDs and complete admission formalities'
    ]
  },
  {
    title: 'OPD Registration',
    icon: FilePlus2,
    path: '/dashboard/staff/patients/add-opd',
    color: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200',
    iconColor: 'text-emerald-600',
    priority: 'High',
    content: [
      'Register Outpatient Department patients',
      'Schedule OPD appointments with doctors',
      'Generate OPD cards and consultation slips'
    ]
  },
  {
    title: 'IPD Registration',
    icon: FilePlus2,
    path: '/dashboard/staff/patients/add-ipd',
    color: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200',
    iconColor: 'text-indigo-600',
    priority: 'High',
    content: [
      'Register Inpatient Department admissions',
      'Assign beds and rooms for IPD patients',
      'Complete IPD admission formalities and documentation'
    ]
  },
  {
    title: 'Appointment Scheduling',
    icon: FaCalendarAlt,
    path: '/dashboard/staff/appointments',
    color: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
    iconColor: 'text-amber-600',
    priority: 'High',
    content: [
      'Schedule new appointments and update existing ones',
      'Handle walk-in patients and emergency bookings',
      'Manage appointment reminders and confirmations'
    ]
  },
  {
    title: 'Patient Discharges',
    icon: FaExchangeAlt,
    path: '/dashboard/staff/discharges',
    color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    iconColor: 'text-purple-600',
    priority: 'High',
    content: [
      'Process patient discharges with billing settlement',
      'Generate discharge summaries and follow-up instructions',
      'Coordinate bed clearance and room preparation'
    ]
  },
  {
    title: 'Patient Billing',
    icon: FaMoneyBillWave,
    path: '/dashboard/staff/billing',
    color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    iconColor: 'text-green-600',
    priority: 'High',
    content: [
      'Review and manage patient billing with detailed breakdowns',
      'Process payments and generate receipts',
      'Manage insurance claims and billing disputes'
    ]
  },
  {
    title: 'Patient Management',
    icon: FaUserInjured,
    path: '/dashboard/staff/patient-list',
    color: 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200',
    iconColor: 'text-rose-600',
    priority: 'Medium',
    content: [
      'Access complete patient profiles with medical history',
      'Update patient information and add clinical notes',
      'Track admission status and treatment progress'
    ]
  },
  {
    title: 'Reports & Analytics',
    icon: FaChartBar,
    path: '/dashboard/staff/reports',
    color: 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200',
    iconColor: 'text-violet-600',
    priority: 'Medium',
    content: [
      'Generate hospital reports including admissions and discharges',
      'Check bed occupancy and department statistics',
      'Export reports for meetings and compliance requirements'
    ]
  },
  {
    title: 'Profile & Settings',
    icon: FaUserCog,
    path: '/dashboard/staff/profile',
    color: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200',
    iconColor: 'text-slate-600',
    priority: 'Low',
    content: [
      'Edit personal details and professional information',
      'Update login credentials and security settings',
      'Set availability preferences and notification settings'
    ]
  },
  {
    title: 'Task Management',
    icon: FaTasks,
    path: '/dashboard/staff/tasks',
    color: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
    iconColor: 'text-gray-600',
    priority: 'Medium',
    content: [
      'Track daily assignments and responsibilities',
      'Receive task assignments from supervisors',
      'Update task status and request assistance when needed'
    ]
  }
];

export const getGuideData = (role) => {
  const guides = {
    admin: adminGuideData,
    doctor: doctorGuideData,
    pharmacy: pharmacyGuideData,
    staff: staffGuideData,
  };
  return guides[role] || [];
};

export const autoCompleteRules = {
  admin: {
    '/dashboard/admin/add-department': (data) => data.departments && data.departments.length > 0,
    '/dashboard/admin/add-room': (data) => data.rooms && data.rooms.length > 0,
    '/dashboard/admin/finance/settings': (data) => data.financeConfigured === true,
    '/dashboard/admin/add-doctor': (data) => data.doctors && data.doctors.length > 0,
    '/dashboard/admin/add-hod-main': (data) => data.hods && data.hods.length > 0,
    '/dashboard/admin/add-staff': (data) => data.staff && data.staff.length > 0,
    '/dashboard/admin/add-registrar': (data) => data.registrars && data.registrars.length > 0,
    '/dashboard/admin/pharmacies/add': (data) => data.pharmacies && data.pharmacies.length > 0,
    '/dashboard/admin/appointments': (data) => data.appointments && data.appointments.length > 0,
    '/dashboard/admin/settings': (data) => data.settingsConfigured === true,
  },
  doctor: {
    '/dashboard/doctor': (data) => data.dashboardViewed === true,
    '/dashboard/doctor/appointments': (data) => data.appointments && data.appointments.length > 0,
    '/dashboard/doctor/prescriptions': (data) => data.prescriptions && data.prescriptions.length > 0,
    '/dashboard/doctor/patients': (data) => data.patients && data.patients.length > 0,
    '/dashboard/doctor/salary': (data) => data.salaryViewed === true,
    '/dashboard/doctor/reports': (data) => data.reports && data.reports.length > 0,
  },
  pharmacy: {
    '/dashboard/pharmacy': (data) => data.dashboardViewed === true,
    '/dashboard/pharmacy/medicine-list': (data) => data.medicines && data.medicines.length > 0,
    '/dashboard/pharmacy/suppliers': (data) => data.suppliers && data.suppliers.length > 0,
    '/dashboard/pharmacy/orders': (data) => data.orders && data.orders.length > 0,
    '/dashboard/pharmacy/pos': (data) => data.sales && data.sales.length > 0,
    '/dashboard/pharmacy/prescriptions/queue': (data) => data.prescriptionsQueue && data.prescriptionsQueue.length > 0,
    '/dashboard/pharmacy/inventory/overview': (data) => data.inventorySetup === true,
    '/dashboard/pharmacy/expired': (data) => data.expiredMedicines && data.expiredMedicines.length > 0,
    '/dashboard/pharmacy/invoices': (data) => data.invoices && data.invoices.length > 0,
  },
  staff: {
    '/dashboard/staff': (data) => data.dashboardViewed === true,
    '/dashboard/staff/add-patient': (data) => data.patientsAdded && data.patientsAdded.length > 0,
    '/dashboard/staff/appointments': (data) => data.appointments && data.appointments.length > 0,
    '/dashboard/staff/discharges': (data) => data.discharges && data.discharges.length > 0,
    '/dashboard/staff/billing': (data) => data.billing && data.billing.length > 0,
  },
};

export const achievements = {
  admin: [
    { id: 'first_dept', title: 'Department Pioneer', description: 'Created first department', icon: '🏥', points: 10 },
    { id: 'first_doctor', title: 'Medical Recruiter', description: 'Added first doctor', icon: '👨‍⚕️', points: 15 },
    { id: 'first_staff', title: 'Team Builder', description: 'Added first staff member', icon: '👥', points: 10 },
    { id: 'first_patient', title: 'First Patient', description: 'Registered first patient', icon: '👤', points: 5 },
    { id: 'setup_complete', title: 'Master Administrator', description: 'Completed all setup steps', icon: '🏆', points: 50 },
  ],
  doctor: [
    { id: 'first_appointment', title: 'First Consultation', description: 'Completed first appointment', icon: '📅', points: 10 },
    { id: 'profile_complete', title: 'Professional Profile', description: 'Completed profile setup', icon: '👔', points: 5 },
    { id: 'schedule_set', title: 'Time Manager', description: 'Set up schedule', icon: '⏰', points: 5 },
    { id: 'first_prescription', title: 'First Prescription', description: 'Wrote first prescription', icon: '💊', points: 10 },
  ],
  pharmacy: [
    { id: 'first_medicine', title: 'Stock Master', description: 'Added first medicine', icon: '💊', points: 10 },
    { id: 'first_sale', title: 'First Sale', description: 'Made first sale', icon: '💰', points: 15 },
    { id: 'inventory_setup', title: 'Inventory Guru', description: 'Set up inventory system', icon: '📦', points: 20 },
  ],
  staff: [
    { id: 'first_admission', title: 'Admission Pro', description: 'Processed first admission', icon: '🏥', points: 10 },
    { id: 'first_billing', title: 'Billing Expert', description: 'Processed first bill', icon: '🧾', points: 10 },
    { id: 'profile_complete', title: 'Professional Setup', description: 'Completed profile setup', icon: '👔', points: 5 },
  ],
};

// Helper to check if step should auto-complete
export const shouldAutoCompleteStep = (role, stepPath, data) => {
  const rules = autoCompleteRules[role];
  if (!rules || !rules[stepPath]) return false;
  return rules[stepPath](data);
};