import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { 
  UserPlus, 
  Receipt, 
  Truck, 
  Settings, 
  Pill,
  ShoppingCart,
  FileText,
  BarChart3,
  Users,
  ClipboardList,
  RefreshCw,
  Shield,
  PillIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  ChevronRight,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Zap
} from 'lucide-react';
import Layout from '@/components/Layout';
import { pharmacySidebar } from '@/constants/sidebarItems/pharmacySidebar';
import { FaPrescription, FaQuestionCircle, FaRegLightbulb, FaChartLine, FaUserMd } from 'react-icons/fa';

const pharmacyGuideData = [
  {
    title: 'Inventory Management',
    icon: <PillIcon className="w-5 h-5 text-blue-600" />,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    gradient: 'from-blue-50 to-blue-100',
    content: [
      'Navigate to "Medicine List" to view all medicines with stock levels and expiry dates',
      'Use "Add Medicine" to add new medicines with details like name, category, dosage, and pricing',
      'Check "Low Stock Alert" for items needing restocking and "Expired Medicines" for disposal',
      'Manage medicine batches with "Batch Management" to track expiry dates and stock levels',
      'Perform "Stock Adjustments" for corrections, damages, or expiry write-offs'
    ],
    path: '/dashboard/pharmacy/medicine-list',
  },
  {
    title: 'Purchasing & Suppliers',
    icon: <ShoppingCartIcon className="w-5 h-5 text-green-600" />,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    gradient: 'from-emerald-50 to-emerald-100',
    content: [
      'Go to "Suppliers List" to manage all your medicine suppliers',
      'Create "Purchase Orders" for new stock with automatic invoice generation',
      'Use "Receive Stock" to update inventory when orders arrive',
      'Track order status from "Ordered" to "Received" with full audit trail',
      'Manage supplier contracts and payment terms in supplier profiles'
    ],
    path: '/dashboard/pharmacy/orders',
  },
  {
    title: 'Point of Sale & Sales',
    icon: <ReceiptIcon className="w-5 h-5 text-purple-600" />,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    gradient: 'from-purple-50 to-purple-100',
    content: [
      'Use "Point of Sale" for quick customer transactions with real-time stock updates',
      'View "Sales History" to analyze daily, weekly, and monthly revenue',
      'Manage customer profiles with purchase history and loyalty programs',
      'Generate automatic invoices for all sales with tax calculations',
      'Handle returns and exchanges through the sales system'
    ],
    path: '/dashboard/pharmacy/pos',
  },
  {
    title: 'Prescription Management',
    icon: <FaPrescription className="w-5 h-5 text-teal-600" />,
    color: 'bg-teal-50 text-teal-600 border-teal-100',
    gradient: 'from-teal-50 to-teal-100',
    content: [
      'Create "New Prescription" with detailed medicine instructions and dosages',
      'Use "Dispense Medication" to process prescriptions and update stock automatically',
      'Track prescription status from "Active" to "Completed" or "Expired"',
      'View prescription history for each patient with refill tracking',
      'Manage prescription queues for efficient pharmacy workflow'
    ],
    path: '/dashboard/pharmacy/prescriptions/list',
  },
  {
    title: 'Billing & Invoicing',
    icon: <FileText className="w-5 h-5 text-orange-600" />,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    gradient: 'from-amber-50 to-amber-100',
    content: [
      'Generate invoices for sales, appointments, and purchase orders',
      'Track payment status with "Paid", "Pending", and "Overdue" filters',
      'Use "Payment Collection" to record cash, card, and digital payments',
      'Manage "Outstanding Payments" with automated reminders',
      'View complete financial audit trail for all transactions'
    ],
    path: '/dashboard/pharmacy/invoices',
  },
  {
    title: 'Customer Management',
    icon: <Users className="w-5 h-5 text-indigo-600" />,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    gradient: 'from-indigo-50 to-indigo-100',
    content: [
      'Add new customers with complete profiles and contact information',
      'Track customer purchase history and preferences',
      'Manage customer loyalty programs and discounts',
      'View customer prescription history and refill patterns',
      'Segment customers for targeted marketing and promotions'
    ],
    path: '/dashboard/pharmacy/customers',
  },
  {
    title: 'Reports & Analytics',
    icon: <BarChart3 className="w-5 h-5 text-rose-600" />,
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    gradient: 'from-rose-50 to-rose-100',
    content: [
      'Generate "Sales Reports" with revenue trends and product performance',
      'Analyze "Inventory Reports" for stock turnover and expiry patterns',
      'View "Profit & Loss" statements with expense tracking',
      'Create "Expiry Reports" to minimize stock waste',
      'Generate "Supplier Reports" for vendor performance analysis'
    ],
    path: '/dashboard/pharmacy/history',
  },
  {
    title: 'Stock Transfers & Returns',
    icon: <RefreshCw className="w-5 h-5 text-amber-600" />,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    gradient: 'from-amber-50 to-amber-100',
    content: [
      'Process "Stock Transfers" between different locations or departments',
      'Handle "Returns to Supplier" for defective or expired medicines',
      'Record "Damage/Waste" with proper documentation and reasons',
      'Track transfer history with complete audit trails',
      'Manage return authorization and credit notes'
    ],
    path: '/dashboard/pharmacy/inventory/overview',
  },
  {
    title: 'Quality & Compliance',
    icon: <Shield className="w-5 h-5 text-slate-600" />,
    color: 'bg-slate-50 text-slate-600 border-slate-100',
    gradient: 'from-slate-50 to-slate-100',
    content: [
      'Maintain medicine quality records with batch tracking',
      'Ensure regulatory compliance with expiry date management',
      'Track prescription drug sales with proper documentation',
      'Maintain audit trails for all pharmacy operations',
      'Generate compliance reports for regulatory requirements'
    ],
    path: '/dashboard/pharmacy/batches',
  }
];

const PharmacyGuidePage = () => {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={pharmacySidebar} section={'Pharmacy'}>
      <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-3xl mb-6 shadow-lg">
            <BookOpen className="w-10 h-10 text-teal-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Pharmacy Management Guide
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Comprehensive guide to managing your pharmacy operations efficiently and effectively
          </p>
        </div>

        {/* Quick Stats Overview - Modern Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div 
            onClick={() => navigate('/dashboard/pharmacy/inventory/medicines')}
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <Pill className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-blue-800">Inventory</h3>
                <p className="text-sm text-blue-600 font-medium">Manage medicines & stock</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/pharmacy/sales/pos')}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-800">Sales</h3>
                <p className="text-sm text-emerald-600 font-medium">POS & transactions</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/pharmacy/prescriptions/list')}
            className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <FaPrescription className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-teal-800">Prescriptions</h3>
                <p className="text-sm text-teal-600 font-medium">Dispensing & tracking</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/dashboard/pharmacy/reports/sales')}
            className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-2xl border border-rose-200 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-rose-800">Reports</h3>
                <p className="text-sm text-rose-600 font-medium">Analytics & insights</p>
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
                  <h2 className="text-lg font-bold text-slate-800">Step-by-Step Operations Guide</h2>
                  <p className="text-slate-500 text-sm">Click on any section to expand details</p>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {pharmacyGuideData.length} modules
              </div>
            </div>
          </div>
          
          <Accordion type="multiple" className="divide-y divide-slate-100">
            {pharmacyGuideData.map((step, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="px-6 transition-all duration-200 hover:bg-slate-50/50"
              >
                <AccordionTrigger className="py-5 font-semibold text-slate-800 hover:text-slate-900 hover:no-underline">
                  <div className="flex justify-between w-full items-center gap-4">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-3 rounded-xl ${step.color.split(' ')[0]} border ${step.color.split(' ')[2]}`}>
                        {step.icon}
                      </div>
                      <div className="text-left">
                        <span className="text-base font-semibold">{step.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-slate-500">
                            {step.content.length} steps
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
                        Go to Module <ChevronRight className="ml-1 w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2 text-slate-700">
                  <div className={`bg-gradient-to-br ${step.gradient} border ${step.color.split(' ')[2]} rounded-xl p-5`}>
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
            ))}
          </Accordion>
        </div>

        {/* Tips & Support Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Tips Section */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-sm border border-amber-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-800 text-lg">💡 Quick Tips & Best Practices</h3>
                <p className="text-amber-600 text-sm">Essential guidelines for smooth operations</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <PillIcon className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Stock Management</h4>
                    <p className="text-amber-700 text-xs">Always check expiry dates when receiving new stock and implement FIFO (First-In, First-Out)</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FaUserMd className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Prescription Handling</h4>
                    <p className="text-amber-700 text-xs">Verify patient details and doctor signatures before dispensing any medication</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <ReceiptIcon className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Sales Process</h4>
                    <p className="text-amber-700 text-xs">Apply appropriate taxes and discounts at POS and keep daily sales reports for reconciliation</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg">
                    <FaChartLine className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 text-sm mb-1">Reporting</h4>
                    <p className="text-amber-700 text-xs">Generate monthly inventory reports to identify slow-moving items and optimize stock levels</p>
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
                <h3 className="font-bold text-slate-800 text-lg">📞 Support & Resources</h3>
                <p className="text-slate-600 text-sm">Get help and access additional resources</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-teal-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <FaQuestionCircle className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Need Immediate Help?</h4>
                      <p className="text-slate-500 text-xs">Contact our support team</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Video Tutorials</h4>
                      <p className="text-slate-500 text-xs">Watch step-by-step guides</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Shield className="w-5 h-5 text-purple-600" />
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
                For urgent assistance, email us at{' '}
                <a href="mailto:support@pharmacy.com" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline">
                  support@pharmacy.com
                </a>
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Support hours: Mon-Sun, 8 AM - 10 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-lg">
            <Zap className="w-5 h-5" />
            <div>
              <p className="font-semibold">Ready to manage your pharmacy efficiently?</p>
              <p className="text-sm opacity-90">Start by exploring any module above</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PharmacyGuidePage;