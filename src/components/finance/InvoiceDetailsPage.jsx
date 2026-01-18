import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { Button } from '../common/FormElements';
import { PrintIcon, DownloadIcon, EditIcon } from '../common/Icons';

const getStatusBadge = (status) => {
  const statusClasses = {
    'Paid': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Issued': 'bg-blue-100 text-blue-800',
    'Partial': 'bg-blue-100 text-blue-800',
    'Overdue': 'bg-red-100 text-red-800',
    'Cancelled': 'bg-gray-100 text-gray-800'
  };
  return `px-3 py-1 text-sm font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
};

const InvoiceDetailsPage = ({ invoiceId, onBack }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      return;
    }
    const fetchInvoice = async () => {
      try {
        const response = await apiClient.get(`/invoices/${invoiceId}`);
        setInvoice(response.data);
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError('Failed to fetch invoice details.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  const handleDownload = async () => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice?.invoice_number || invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download invoice");
    }
  };

  const handlePrint = () => {
    // Logic for printing, possibly opening a new window with print view
    window.print();
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!invoice) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No invoice selected or found.</p>
        <Button onClick={onBack} variant="link">
          Back to Invoice List
        </Button>
      </div>
    );
  }

  const outstanding = (invoice.total || 0) - (invoice.amount_paid || 0);
  const patientName = invoice.patient_id ? `${invoice.patient_id.first_name || ''} ${invoice.patient_id.last_name || ''}`.trim() : (invoice.customer_name || 'Unknown');

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Invoice Details</h1>
            <p className="text-gray-600 mt-1">{invoice.invoice_number}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint}><PrintIcon /> Print</Button>
            <Button variant="outline" size="sm" onClick={handleDownload}><DownloadIcon /> Download</Button>
            <Button variant="secondary" size="sm" onClick={onBack}>
              Back to List
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Invoice Information</h3>
              <div className="space-y-3">
                <p className="flex justify-between"><span>Invoice #:</span> <span className="font-medium">{invoice.invoice_number}</span></p>
                <p className="flex justify-between"><span>Issue Date:</span> <span className="font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</span></p>
                <p className="flex justify-between"><span>Due Date:</span> <span className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</span></p>
                <p className="flex justify-between items-center"><span>Status:</span> <span className={getStatusBadge(invoice.status)}>{invoice.status}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="space-y-3">
                <p className="flex justify-between"><span>Name:</span> <span className="font-medium">{patientName}</span></p>
                <p className="flex justify-between"><span>Phone:</span> <span className="font-medium">{invoice.patient_id?.phone || invoice.customer_phone || 'N/A'}</span></p>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Items / Services</h3>
            <table className="w-full border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase">Unit Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {/* Handle Service Items */}
                {invoice.service_items && invoice.service_items.map((item, index) => (
                  <tr key={`srv-${index}`}>
                    <td className="px-6 py-4 text-sm">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-right">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-right">₹{item.unit_price ? item.unit_price.toFixed(2) : (item.total_price / (item.quantity || 1)).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-right">₹{item.total_price ? item.total_price.toFixed(2) : (item.amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {/* Handle Medicine Items */}
                {invoice.medicine_items && invoice.medicine_items.map((item, index) => (
                  <tr key={`med-${index}`}>
                    <td className="px-6 py-4 text-sm">{item.medicine_name} {item.batch_number ? `(${item.batch_number})` : ''}</td>
                    <td className="px-6 py-4 text-sm text-right">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-right">₹{item.unit_price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-right">₹{item.total_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <p className="flex justify-between"><span>Subtotal:</span> <span className="font-medium">₹{invoice.subtotal.toFixed(2)}</span></p>
              <p className="flex justify-between"><span>Tax:</span> <span className="font-medium">₹{invoice.tax.toFixed(2)}</span></p>
              <p className="flex justify-between"><span>Discount:</span> <span className="font-medium text-red-500">-₹{invoice.discount ? invoice.discount.toFixed(2) : '0.00'}</span></p>
              <p className="flex justify-between border-t pt-3"><span className="text-lg font-semibold">Total:</span> <span className="text-lg font-bold">₹{invoice.total.toFixed(2)}</span></p>
              <p className="flex justify-between text-green-600"><span>Amount Paid:</span> <span className="font-bold">₹{invoice.amount_paid.toFixed(2)}</span></p>
              {outstanding > 0 && <p className="flex justify-between text-red-600"><span>Outstanding:</span> <span className="font-bold">₹{outstanding.toFixed(2)}</span></p>}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment History</h3>
              {invoice.payment_history && invoice.payment_history.length > 0 ? (
                <div className="space-y-3">
                  {invoice.payment_history.map((p, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 flex justify-between items-start">
                      <div>
                        <p className="font-medium">₹{p.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{p.method}</p>
                        <p className="text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm font-medium text-green-600">{p.status || 'Completed'}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-gray-500">No payments recorded.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsPage;