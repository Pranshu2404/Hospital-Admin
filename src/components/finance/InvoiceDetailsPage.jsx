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
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchHospitalInfo();
    fetchDoctors();

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

  const fetchHospitalInfo = async () => {
    try {
      const res = await apiClient.get('/hospitals');
      if (res.data && res.data.length > 0) {
        setHospitalInfo(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching hospital info:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await apiClient.get('/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const getDoctorName = () => {
    if (!invoice) return 'N/A';
    let doc = null;

    // Check direct doctor_id (if exists on invoice schema)
    if (invoice.doctor_id) {
      if (typeof invoice.doctor_id === 'object') doc = invoice.doctor_id;
      else doc = doctors.find(d => d._id === invoice.doctor_id);
    }

    // Check appointment doctor
    if (!doc && invoice.appointment_id) {
      // If appointment_id is populated object
      if (typeof invoice.appointment_id === 'object' && invoice.appointment_id.doctor_id) {
        if (typeof invoice.appointment_id.doctor_id === 'object') doc = invoice.appointment_id.doctor_id;
        else doc = doctors.find(d => d._id === invoice.appointment_id.doctor_id);
      }
    }

    if (doc && (doc.firstName || doc.first_name || doc.name)) {
      return `${doc.firstName || doc.first_name || doc.name || ''} ${doc.lastName || doc.last_name || ''}`.trim();
    }
    return 'N/A';
  };

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
      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body, html {
            height: 100%;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          /* hide everything first */
          body * { 
            visibility: hidden; 
          }
          /* reveal only printable slip */
          .printable-invoice-container, .printable-invoice-container * {
            visibility: visible;
          }
          .printable-invoice-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            z-index: 9999;
            background: white;
          }
          
          .printable-invoice { 
            width: 210mm;
            min-height: 297mm;
            padding: 10mm;
            background: white;
            font-size: 11pt;
            box-sizing: border-box;
          }

          /* Header */
          .invoice-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            border-bottom: 4px double #333;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          
          .logo-area {
            width: 100px;
            height: 100px;
          }
          .logo-area img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }

          .hospital-details {
            text-align: center;
            flex: 1;
            padding: 0 20px;
          }
          
          .hospital-name {
            font-family: "Times New Roman", Times, serif;
            font-size: 24pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
          }
          
          .hospital-address {
            font-size: 10pt;
            margin-top: 5px;
          }

          .invoice-title-box {
            border: 2px solid #333;
            padding: 5px 10px;
            text-align: center;
            text-transform: uppercase;
            font-weight: bold;
            font-size: 14pt;
          }

          /* Tables and Details */
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
            font-size: 11pt;
          }
          
          .details-item {
            display: flex;
          }
          .details-label {
            font-weight: bold;
            width: 120px;
            color: #444;
          }
          .details-value {
            font-weight: 600;
          }

          table.invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          table.invoice-table th, table.invoice-table td {
            border-bottom: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          table.invoice-table th {
            background-color: #f3f4f6 !important;
            text-transform: uppercase;
            font-size: 9pt;
            -webkit-print-color-adjust: exact;
          }

          .footer-section {
            margin-top: 40px;
            border-top: 1px dashed #aaa;
            padding-top: 10px;
            text-align: center;
            font-size: 9pt;
            color: #666;
          }
        }

        @media screen {
          .printable-invoice-container {
            display: none;
          }
        }
        `}</style>

      {/* Hidden Printable Invoice Structure */}
      {invoice && (
        <div className="printable-invoice-container">
          <div className="printable-invoice">

            {/* Header */}
            <div className="invoice-header">
              <div className="logo-area">
                {hospitalInfo?.logo ? (
                  <img src={hospitalInfo.logo} alt="Logo" />
                ) : (
                  <div className="w-full h-full border border-dashed flex items-center justify-center text-xs">LOGO</div>
                )}
              </div>
              <div className="hospital-details">
                <h1 className="hospital-name">{hospitalInfo?.hospitalName || 'HOSPITAL NAME'}</h1>
                <div className="hospital-address">
                  <p>{hospitalInfo?.address || 'Address Line 1, Address Line 2'}</p>
                  <p>Phone: {hospitalInfo?.contact || 'N/A'}</p>
                  {hospitalInfo?.email && <p>Email: {hospitalInfo.email}</p>}
                </div>
              </div>
              <div>
                <div className="invoice-title-box">INVOICE</div>
                <div className="text-center text-xs mt-1">
                  {invoice.status === 'Paid' ? '(PAID)' : '(PENDING)'}
                </div>
              </div>
            </div>

            {/* Patient & Invoice Details */}
            <div className="details-grid">
              <div className="details-item">
                <span className="details-label">Invoice No:</span>
                <span className="details-value">{invoice.invoice_number}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Date:</span>
                <span className="details-value">{new Date(invoice.issue_date).toLocaleDateString()}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Patient Name:</span>
                <span className="details-value">{patientName}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Patient ID:</span>
                <span className="details-value">{invoice.patient_id?.patientId || invoice.customer_phone || 'N/A'}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Doctor:</span>
                <span className="details-value">{getDoctorName()}</span>
              </div>
              {/* <div className="details-item">
                  <span className="details-label">Payment Mode:</span>
                  <span className="details-value">{invoice.payment_method || 'N/A'}</span>
                </div> */}
            </div>

            {/* Items Table */}
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.service_items && invoice.service_items.map((item, idx) => (
                  <tr key={`srv-${idx}`}>
                    <td>{item.description}</td>
                    <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{item.unit_price ? item.unit_price.toFixed(2) : (item.total_price / (item.quantity || 1)).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{item.total_price ? item.total_price.toFixed(2) : (item.amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
                {invoice.medicine_items && invoice.medicine_items.map((item, idx) => (
                  <tr key={`med-${idx}`}>
                    <td>{item.medicine_name} {item.batch_number ? `(${item.batch_number})` : ''}</td>
                    <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{item.unit_price?.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>{item.total_price?.toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid #333', fontWeight: 'bold' }}>
                  <td colSpan={3} style={{ textAlign: 'right', paddingRight: '20px' }}>TOTAL:</td>
                  <td style={{ textAlign: 'right' }}>₹{invoice.total?.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <div className="footer-section">
              <p>This is a computer-generated invoice and needs no signature.</p>
              <p>Thank you for choosing {hospitalInfo?.hospitalName || 'us'}.</p>
            </div>

          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Invoice Details</h1>
            <p className="text-gray-600 mt-1">{invoice.invoice_number}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint}><PrintIcon /> Print</Button>
            {/* <Button variant="outline" size="sm" onClick={handleDownload}><DownloadIcon /> Download</Button> */}
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