import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { UserPlus, Receipt, Truck, Settings } from 'lucide-react';
import { MedicineIcon } from '@/components/common/Icons';
import Layout from '@/components/Layout';
import { pharmacySidebar } from '@/constants/sidebarItems/pharmacySidebar';

const pharmacyGuideData = [
  {
    title: 'Add Medicines',
    icon: <MedicineIcon className="w-5 h-5 mr-2 text-teal-600" />,
    content: [
      'Navigate to "Add Medicine" to input medicine details such as name, type, manufacturer, and quantity.',
      'Ensure all mandatory fields are filled correctly. Use "Medicine List" to review added items.'
    ],
    route: '/dashboard/pharmacy/add-medicine',
  },
  {
    title: 'Manage Customers',
    icon: <UserPlus className="w-5 h-5 mr-2 text-teal-600" />,
    content: [
      'Go to "Add Customer" to register new customers with contact info and purchase history.',
      'Use "Customer List" to search, view, or update existing customer profiles.'
    ],
    route: '/dashboard/pharmacy/customers',
  },
  {
    title: 'Generate Invoices',
    icon: <Receipt className="w-5 h-5 mr-2 text-teal-600" />,
    content: [
      'Head over to "Invoices" to generate new invoices for customer purchases.',
      'Use "Invoice List" to track all sales and invoice details, including tax and discounts.'
    ],
    route: '/dashboard/pharmacy/invoices',
  },
  {
    title: 'Inventory Management',
    icon: <Truck className="w-5 h-5 mr-2 text-teal-600" />,
    content: [
      'Under "Inventory", monitor medicine stock levels, expiry dates, and restock alerts.',
      'Update stock after new purchases or expired item removal.'
    ],
    route: '/dashboard/pharmacy/inventory',
  },
  {
    title: 'Profile & Settings',
    icon: <Settings className="w-5 h-5 mr-2 text-teal-600" />,
    content: [
      'Navigate to your "Profile" to manage pharmacy info and user credentials.',
      'Visit "Settings" to update configurations, tax rates, and notification preferences.'
    ],
    route: '/dashboard/pharmacy/profile',
  }
];

const PharmacyGuidePage = () => {
  const navigate = useNavigate();

  return (
    <Layout sidebarItems={pharmacySidebar}>
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Pharmacy Portal Guide</h2>
        <Accordion type="multiple" className="space-y-4">
          {pharmacyGuideData.map((step, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-xl border border-teal-200 shadow-sm"
            >
              <AccordionTrigger className="p-4 font-semibold text-lg text-teal-900 hover:text-teal-600">
                <div className="flex justify-between w-full items-center gap-3">
                  <div className="flex items-center gap-5 w-full text-nowrap">
                    {step.icon}
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
};

export default PharmacyGuidePage;
