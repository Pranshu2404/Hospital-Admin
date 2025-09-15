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
  ReceiptIcon
} from 'lucide-react';
import Layout from '@/components/Layout';
import { pharmacySidebar } from '@/constants/sidebarItems/pharmacySidebar';
import { FaPrescription } from 'react-icons/fa';

const pharmacyGuideData = [
  {
    title: 'Inventory Management',
    icon: <PillIcon className="w-5 h-5 mr-2 text-blue-600" />,
    content: [
      'Navigate to "Medicine List" to view all medicines with stock levels and expiry dates',
      'Use "Add Medicine" to add new medicines with details like name, category, dosage, and pricing',
      'Check "Low Stock Alert" for items needing restocking and "Expired Medicines" for disposal',
      'Manage medicine batches with "Batch Management" to track expiry dates and stock levels',
      'Perform "Stock Adjustments" for corrections, damages, or expiry write-offs'
    ],
    path: '/dashboard/pharmacy/inventory/medicines',
  },
  {
    title: 'Purchasing & Suppliers',
    icon: <ShoppingCartIcon className="w-5 h-5 mr-2 text-green-600" />,
    content: [
      'Go to "Suppliers List" to manage all your medicine suppliers',
      'Create "Purchase Orders" for new stock with automatic invoice generation',
      'Use "Receive Stock" to update inventory when orders arrive',
      'Track order status from "Ordered" to "Received" with full audit trail',
      'Manage supplier contracts and payment terms in supplier profiles'
    ],
    path: '/dashboard/pharmacy/purchasing/orders',
  },
  {
    title: 'Point of Sale & Sales',
    icon: <ReceiptIcon className="w-5 h-5 mr-2 text-purple-600" />,
    content: [
      'Use "Point of Sale" for quick customer transactions with real-time stock updates',
      'View "Sales History" to analyze daily, weekly, and monthly revenue',
      'Manage customer profiles with purchase history and loyalty programs',
      'Generate automatic invoices for all sales with tax calculations',
      'Handle returns and exchanges through the sales system'
    ],
    path: '/dashboard/pharmacy/sales/pos',
  },
  {
    title: 'Prescription Management',
    icon: <FaPrescription className="w-5 h-5 mr-2 text-teal-600" />,
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
    icon: <FileText className="w-5 h-5 mr-2 text-orange-600" />,
    content: [
      'Generate invoices for sales, appointments, and purchase orders',
      'Track payment status with "Paid", "Pending", and "Overdue" filters',
      'Use "Payment Collection" to record cash, card, and digital payments',
      'Manage "Outstanding Payments" with automated reminders',
      'View complete financial audit trail for all transactions'
    ],
    path: '/dashboard/pharmacy/billing/invoices',
  },
  {
    title: 'Customer Management',
    icon: <Users className="w-5 h-5 mr-2 text-indigo-600" />,
    content: [
      'Add new customers with complete profiles and contact information',
      'Track customer purchase history and preferences',
      'Manage customer loyalty programs and discounts',
      'View customer prescription history and refill patterns',
      'Segment customers for targeted marketing and promotions'
    ],
    path: '/dashboard/pharmacy/sales/customers',
  },
  {
    title: 'Reports & Analytics',
    icon: <BarChart3 className="w-5 h-5 mr-2 text-red-600" />,
    content: [
      'Generate "Sales Reports" with revenue trends and product performance',
      'Analyze "Inventory Reports" for stock turnover and expiry patterns',
      'View "Profit & Loss" statements with expense tracking',
      'Create "Expiry Reports" to minimize stock waste',
      'Generate "Supplier Reports" for vendor performance analysis'
    ],
    path: '/dashboard/pharmacy/reports/sales',
  },
  {
    title: 'Stock Transfers & Returns',
    icon: <RefreshCw className="w-5 h-5 mr-2 text-amber-600" />,
    content: [
      'Process "Stock Transfers" between different locations or departments',
      'Handle "Returns to Supplier" for defective or expired medicines',
      'Record "Damage/Waste" with proper documentation and reasons',
      'Track transfer history with complete audit trails',
      'Manage return authorization and credit notes'
    ],
    path: '/dashboard/pharmacy/transfers/stock',
  },
  {
    title: 'Quality & Compliance',
    icon: <Shield className="w-5 h-5 mr-2 text-gray-600" />,
    content: [
      'Maintain medicine quality records with batch tracking',
      'Ensure regulatory compliance with expiry date management',
      'Track prescription drug sales with proper documentation',
      'Maintain audit trails for all pharmacy operations',
      'Generate compliance reports for regulatory requirements'
    ],
    path: '/dashboard/pharmacy/inventory/batches',
  },
  {
    title: 'Settings & Configuration',
    icon: <Settings className="w-5 h-5 mr-2 text-gray-600" />,
    content: [
      'Configure pharmacy settings including tax rates and billing preferences',
      'Set up user roles and permissions for staff members',
      'Manage medicine categories and pricing structures',
      'Configure automatic alerts for low stock and expiry dates',
      'Set up backup and restore procedures for data safety'
    ],
    path: '/dashboard/pharmacy/settings/general',
  }
];

const PharmacyGuidePage = () => {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={pharmacySidebar} section={'Pharmacy'}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Pharmacy Management System Guide
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive guide to managing your pharmacy operations efficiently
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <Pill className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-800">Inventory</h3>
                <p className="text-sm text-blue-600">Manage medicines & stock</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-800">Sales</h3>
                <p className="text-sm text-green-600">POS & transactions</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <FaPrescription className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-semibold text-purple-800">Prescriptions</h3>
                <p className="text-sm text-purple-600">Dispensing & tracking</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold text-orange-800">Reports</h3>
                <p className="text-sm text-orange-600">Analytics & insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Guide Content */}
        <div className="bg-white rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-800 p-6 border-b">
            Step-by-Step Operations Guide
          </h2>
          
          <Accordion type="multiple" className="divide-y">
            {pharmacyGuideData.map((step, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="px-6"
              >
                <AccordionTrigger className="py-4 font-semibold text-lg text-gray-900 hover:text-blue-600">
                  <div className="flex justify-between w-full items-center gap-3">
                    <div className="flex items-center gap-4 w-full">
                      {step.icon}
                      <span>{step.title}</span>
                    </div>
                    <Button
                      className="bg-teal-600 hover:bg-blue-700 text-white mr-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(step.path);
                      }}
                    >
                      Go to {step.title.split(' ')[0]}
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-gray-700 space-y-3">
                  {step.content.map((point, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="w-2 h-2 bg-teal-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <p className="text-base">{point}</p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Quick Tips Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-800 mb-3">💡 Quick Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Stock Management:</strong> Always check expiry dates when receiving new stock
            </div>
            <div>
              <strong>Prescriptions:</strong> Verify patient details before dispensing medication
            </div>
            <div>
              <strong>Sales:</strong> Apply appropriate taxes and discounts at POS
            </div>
            <div>
              <strong>Reports:</strong> Generate daily sales reports for cash reconciliation
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need help? Contact support at{' '}
            <a href="mailto:support@pharmacy.com" className="text-blue-600 hover:underline">
              support@pharmacy.com
            </a>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PharmacyGuidePage;