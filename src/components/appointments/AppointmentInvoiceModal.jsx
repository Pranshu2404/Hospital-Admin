import React from 'react';
import { FaTimes, FaPrint, FaDownload } from 'react-icons/fa';

const AppointmentInvoiceModal = ({ isOpen, onClose, invoiceData, hospitalInfo }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (invoiceData.invoiceId) {
      try {
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
        console.error('Error downloading invoice:', err);
        alert('Failed to download invoice');
      }
    }
  };

  return (
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
                <p className="font-semibold">{invoiceData.patientName}</p>
                <p className="text-sm text-gray-600">ID: {invoiceData.patient_id?.patientId}</p>
              </div>
              <div>
                <h4 className="text-xs text-gray-500 uppercase mb-1">Doctor</h4>
                <p className="font-semibold">{invoiceData.doctorName}</p>
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
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
            >
              <FaDownload /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentInvoiceModal;