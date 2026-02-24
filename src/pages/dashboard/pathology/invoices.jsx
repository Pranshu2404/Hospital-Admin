import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import InvoiceDetailsPage from '../../../components/finance/InvoiceDetailsPage';
import { pathologySidebar } from '@/constants/sidebarItems/pathologySidebar';
import PathologyInvoiceListPage from './invoicelist';

const PathologyInvoice = () => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  return (
    <Layout sidebarItems={pathologySidebar}>
      {selectedInvoiceId ? (
        <InvoiceDetailsPage
          invoiceId={selectedInvoiceId}
          onBack={() => setSelectedInvoiceId(null)}
        />
      ) : (
        <PathologyInvoiceListPage
          onViewDetails={(id) => setSelectedInvoiceId(id)}
        />
      )}
    </Layout>
  );
};

export default PathologyInvoice;
