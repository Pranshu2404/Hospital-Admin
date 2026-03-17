import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import InvoiceListPage from '../../../components/finance/InvoiceListPage';
import InvoiceDetailsPage from '../../../components/finance/InvoiceDetailsPage';
import { adminSidebar } from '../../../constants/sidebarItems/adminSidebar';
import { demoSidebar } from '@/constants/sidebarItems/demoSidebar';

const Invoice = () => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  return (
    <Layout sidebarItems={demoSidebar} section="Demo User">
      {selectedInvoiceId ? (
        <InvoiceDetailsPage
          invoiceId={selectedInvoiceId}
          onBack={() => setSelectedInvoiceId(null)}
        />
      ) : (
        <InvoiceListPage
          onViewDetails={(id) => setSelectedInvoiceId(id)}
        />
      )}
    </Layout>
  );
};

export default Invoice;
