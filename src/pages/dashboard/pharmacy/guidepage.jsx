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
  Zap,
  DollarSign
} from 'lucide-react';
import Layout from '@/components/Layout';
import { pharmacySidebar } from '@/constants/sidebarItems/pharmacySidebar';
import { FaPrescription, FaQuestionCircle, FaRegLightbulb, FaChartLine, FaUserMd, FaChevronRight } from 'react-icons/fa';

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
    path: '/dashboard/pharmacy/receive-stock/:id',
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
                      {pharmacyGuideData.map((step, index) => {
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