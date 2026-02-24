import React, { useState, useEffect } from 'react';
import { FaTimes, FaPrint, FaDownload, FaSync } from 'react-icons/fa';
import axios from 'axios';

const AppointmentInvoiceModal = ({ isOpen, onClose, invoiceData, hospitalInfo, doctors = [] }) => {
  const [downloading, setDownloading] = useState(false);
  const [printableInvoice, setPrintableInvoice] = useState(null);

  useEffect(() => {
    if (printableInvoice) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printableInvoice]);

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getDoctorName = () => {
    if (!invoiceData) return 'N/A';
    
    if (invoiceData.doctorName) {
      return invoiceData.doctorName;
    }
    
    if (invoiceData.doctor_id) {
      if (typeof invoiceData.doctor_id === 'object') {
        const doc = invoiceData.doctor_id;
        return `${doc.firstName || doc.first_name || ''} ${doc.lastName || doc.last_name || ''}`.trim() || 'N/A';
      }
      const doc = doctors.find(d => d._id === invoiceData.doctor_id);
      if (doc) {
        return `${doc.firstName || doc.first_name || ''} ${doc.lastName || doc.last_name || ''}`.trim();
      }
    }
    
    return 'N/A';
  };

  const generateInvoiceHTML = () => {
    const doctorName = getDoctorName();
    const patientName = invoiceData.patientName || 
      (invoiceData.patient_id ? 
        `${invoiceData.patient_id.first_name || ''} ${invoiceData.patient_id.last_name || ''}`.trim() : 
        'Unknown');
    const patientId = invoiceData.patient_id?.patientId || 'N/A';
    const appointmentDate = invoiceData.appointment_date ? 
      new Date(invoiceData.appointment_date).toLocaleDateString() : 
      new Date().toLocaleDateString();

    // Generate items HTML
    const itemsHTML = invoiceData.items?.map(item => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align: right">1</td>
        <td style="text-align: right">₹${(item.amount || 0).toFixed(2)}</td>
        <td style="text-align: right">₹${(item.amount || 0).toFixed(2)}</td>
      </tr>
    `).join('') || '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appointment Invoice #${invoiceData.invoiceNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10mm;
              line-height: 1.6;
              -webkit-print-color-adjust: exact;
            }
            .invoice-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
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
              background-color: #f8f9fa;
            }
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
              font-size: 10pt;
            }
            table.invoice-table th {
              background-color: #f3f4f6;
              text-transform: uppercase;
              font-size: 9pt;
              padding: 10px 8px;
              border-bottom: 2px solid #333;
            }
            table.invoice-table td {
              border-bottom: 1px solid #ddd;
              padding: 8px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 9px;
              font-weight: bold;
            }
            .status-paid { background-color: #D1FAE5; color: #065F46; }
            .status-pending { background-color: #FEF3C7; color: #92400E; }
            .footer-section {
              margin-top: 40px;
              border-top: 1px dashed #aaa;
              padding-top: 10px;
              text-align: center;
              font-size: 9pt;
              color: #666;
            }
            .totals-section {
              margin-top: 20px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-box {
              width: 300px;
              border: 1px solid #ddd;
              padding: 15px;
              background-color: #f9f9f9;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .grand-total {
              font-weight: bold;
              font-size: 12pt;
              border-top: 2px solid #333;
              padding-top: 8px;
              margin-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="logo-area">
              ${hospitalInfo?.logo 
                ? `<img src="${hospitalInfo.logo}" alt="Logo" />` 
                : '<div style="width:100%;height:100%;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:10px;">LOGO</div>'
              }
            </div>
            <div class="hospital-details">
              <h1 class="hospital-name">${hospitalInfo?.hospitalName || 'HOSPITAL NAME'}</h1>
              <div class="hospital-address">
                <p>${hospitalInfo?.address || 'Address Line 1, Address Line 2'}</p>
                <p>Phone: ${hospitalInfo?.contact || 'N/A'}</p>
                ${hospitalInfo?.email ? `<p>Email: ${hospitalInfo.email}</p>` : ''}
              </div>
            </div>
            <div>
              <div class="invoice-title-box">APPOINTMENT INVOICE</div>
              <div style="text-align:center;font-size:10px;margin-top:4px;">
                ${invoiceData.status === 'Paid' ? '(PAID)' : '(PENDING)'}
              </div>
            </div>
          </div>

          <div class="details-grid">
            <div class="details-item"><span class="details-label">Invoice No:</span><span class="details-value">${invoiceData.invoiceNumber}</span></div>
            <div class="details-item"><span class="details-label">Date:</span><span class="details-value">${new Date(invoiceData.generated_at).toLocaleDateString()}</span></div>
            <div class="details-item"><span class="details-label">Appointment:</span><span class="details-value">${appointmentDate}</span></div>
            <div class="details-item"><span class="details-label">Patient Name:</span><span class="details-value">${patientName}</span></div>
            <div class="details-item"><span class="details-label">Patient ID:</span><span class="details-value">${patientId}</span></div>
            <div class="details-item"><span class="details-label">Doctor:</span><span class="details-value">${doctorName}</span></div>
            <div class="details-item"><span class="details-label">Department:</span><span class="details-value">${invoiceData.departmentName || 'N/A'}</span></div>
            <div class="details-item"><span class="details-label">Payment Method:</span><span class="details-value">${invoiceData.payment_method || 'N/A'}</span></div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right">Qty</th>
                <th style="text-align: right">Unit Price</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-box">
              <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${(invoiceData.total_amount || 0).toFixed(2)}</span>
              </div>
              <div class="total-row grand-total">
                <span>Total:</span>
                <span>₹${(invoiceData.total_amount || 0).toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Payment Status:</span>
                <span class="${invoiceData.status === 'Paid' ? 'status-paid' : 'status-pending'}">
                  ${invoiceData.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div class="footer-section">
            <p>This is a computer-generated invoice and needs no signature.</p>
            <p>Thank you for choosing ${hospitalInfo?.hospitalName || 'us'}.</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    setPrintableInvoice(invoiceData);
  };

  const handleDownload = async () => {
    if (invoiceData.invoiceId) {
      setDownloading(true);
      try {
        // Try to download from API first
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/invoices/${invoiceData.invoiceId}/download`,
          { responseType: 'blob' }
        );
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${invoiceData.invoiceNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error('Error downloading invoice PDF:', err);
        
        // Fallback to HTML download
        const htmlContent = generateInvoiceHTML();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${invoiceData.invoiceNumber}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } finally {
        setDownloading(false);
      }
    } else {
      // If no invoiceId, generate HTML download
      const htmlContent = generateInvoiceHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceData.invoiceNumber || 'appointment'}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      {/* Hidden Printable Invoice Structure */}
      {printableInvoice && (
        <div className="printable-invoice-container">
          <div className="printable-invoice">
            <style>{`
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 10mm;
                line-height: 1.6;
                -webkit-print-color-adjust: exact;
              }
              .invoice-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
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
                background-color: #f8f9fa;
              }
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
                font-size: 10pt;
              }
              table.invoice-table th {
                background-color: #f3f4f6;
                text-transform: uppercase;
                font-size: 9pt;
                padding: 10px 8px;
                border-bottom: 2px solid #333;
              }
              table.invoice-table td {
                border-bottom: 1px solid #ddd;
                padding: 8px;
              }
              .totals-section {
                margin-top: 20px;
                display: flex;
                justify-content: flex-end;
              }
              .totals-box {
                width: 300px;
                border: 1px solid #ddd;
                padding: 15px;
                background-color: #f9f9f9;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
              }
              .grand-total {
                font-weight: bold;
                font-size: 12pt;
                border-top: 2px solid #333;
                padding-top: 8px;
                margin-top: 8px;
              }
              .footer-section {
                margin-top: 40px;
                border-top: 1px dashed #aaa;
                padding-top: 10px;
                text-align: center;
                font-size: 9pt;
                color: #666;
              }
            `}</style>
            
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
                <div className="invoice-title-box">APPOINTMENT INVOICE</div>
                <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '4px' }}>
                  {invoiceData.status === 'Paid' ? '(PAID)' : '(PENDING)'}
                </div>
              </div>
            </div>

            <div className="details-grid">
              <div className="details-item">
                <span className="details-label">Invoice No:</span>
                <span className="details-value">{invoiceData.invoiceNumber}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Date:</span>
                <span className="details-value">{new Date(invoiceData.generated_at).toLocaleDateString()}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Appointment:</span>
                <span className="details-value">
                  {new Date(invoiceData.appointment_date).toLocaleDateString()}
                </span>
              </div>
              <div className="details-item">
                <span className="details-label">Patient Name:</span>
                <span className="details-value">
                  {invoiceData.patientName || 
                    (invoiceData.patient_id ? 
                      `${invoiceData.patient_id.first_name || ''} ${invoiceData.patient_id.last_name || ''}`.trim() : 
                      'Unknown')}
                </span>
              </div>
              <div className="details-item">
                <span className="details-label">Patient ID:</span>
                <span className="details-value">{invoiceData.patient_id?.patientId || 'N/A'}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Doctor:</span>
                <span className="details-value">{getDoctorName()}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Department:</span>
                <span className="details-value">{invoiceData.departmentName || 'N/A'}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Payment Method:</span>
                <span className="details-value">{invoiceData.payment_method || 'N/A'}</span>
              </div>
            </div>

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
                {invoiceData.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td style={{ textAlign: 'right' }}>1</td>
                    <td style={{ textAlign: 'right' }}>₹{(item.amount || 0).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>₹{(item.amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="totals-section">
              <div className="totals-box">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>₹{(invoiceData.total_amount || 0).toFixed(2)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>₹{(invoiceData.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="footer-section">
              <p>This is a computer-generated invoice and needs no signature.</p>
              <p>Thank you for choosing {hospitalInfo?.hospitalName || 'us'}.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <h3 className="text-xl font-bold text-gray-800">Appointment Invoice</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-6">
            {/* Invoice Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-teal-600">{hospitalInfo?.hospitalName || 'Hospital'}</h2>
                  <p className="text-sm text-gray-600">{hospitalInfo?.address}</p>
                  <p className="text-sm text-gray-600">Phone: {hospitalInfo?.contact}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Invoice #: {invoiceData.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(invoiceData.generated_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient & Doctor Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-1">Patient</h4>
                  <p className="font-semibold">
                    {invoiceData.patientName || 
                      (invoiceData.patient_id ? 
                        `${invoiceData.patient_id.first_name || ''} ${invoiceData.patient_id.last_name || ''}`.trim() : 
                        'Unknown')}
                  </p>
                  <p className="text-sm text-gray-600">ID: {invoiceData.patient_id?.patientId}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-500 uppercase mb-1">Doctor</h4>
                  <p className="font-semibold">{getDoctorName()}</p>
                  <p className="text-sm text-gray-600">{invoiceData.departmentName}</p>
                </div>
              </div>

              {/* Items */}
              <table className="w-full mb-6">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoiceData.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300">
                    <td className="px-4 py-3 text-base font-bold text-gray-900">Total</td>
                    <td className="px-4 py-3 text-base font-bold text-right text-teal-600">
                      {formatCurrency(invoiceData.total_amount)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Payment Method</p>
                    <p className="font-medium">{invoiceData.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Payment Status</p>
                    <p className="font-medium">
                      {invoiceData.status === 'Paid' ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>This is a computer generated invoice and does not require a physical signature.</p>
                <p>Thank you for choosing {hospitalInfo?.hospitalName || 'us'}.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <FaPrint /> Print
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 ${
                  downloading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {downloading ? <FaSync className="animate-spin" /> : <FaDownload />}
                {downloading ? 'Downloading...' : 'Download Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>

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
          body * { 
            visibility: hidden; 
          }
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
          .invoice-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            border-bottom: 4px double #333;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .logo-area { width: 100px; height: 100px; }
          .logo-area img { max-width: 100%; max-height: 100%; object-fit: contain; }
          .hospital-details { text-align: center; flex: 1; padding: 0 20px; }
          .hospital-name { font-family: "Times New Roman", Times, serif; font-size: 24pt; font-weight: bold; text-transform: uppercase; margin: 0; }
          .hospital-address { font-size: 10pt; margin-top: 5px; }
          .invoice-title-box { border: 2px solid #333; padding: 5px 10px; text-align: center; text-transform: uppercase; font-weight: bold; font-size: 14pt; background-color: #f8f9fa !important; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; font-size: 11pt; }
          .details-item { display: flex; }
          .details-label { font-weight: bold; width: 120px; color: #444; }
          .details-value { font-weight: 600; }
          table.invoice-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          table.invoice-table th, table.invoice-table td { border-bottom: 1px solid #ddd; padding: 8px; text-align: left; }
          table.invoice-table th { background-color: #f3f4f6 !important; text-transform: uppercase; font-size: 9pt; -webkit-print-color-adjust: exact; }
          .footer-section { margin-top: 40px; border-top: 1px dashed #aaa; padding-top: 10px; text-align: center; font-size: 9pt; color: #666; }
          .totals-section { margin-top: 20px; }
          .totals-box { width: 300px; margin-left: auto; }
        }
      `}</style>
    </>
  );
};

export default AppointmentInvoiceModal;