import { useState } from 'react';
import { Button } from '../common/FormElements';
import { PrintIcon, DownloadIcon, EditIcon } from '../common/Icons';

const InvoiceDetailsPage = ({ selectedInvoice, setCurrentPage }) => {
  const [paymentHistory] = useState([
    {
      id: 1,
      date: '2024-01-15',
      amount: 247.50,
      method: 'Credit Card',
      reference: 'PMT-001',
      status: 'Completed'
    }
  ]);

  if (!selectedInvoice) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">No invoice selected</p>
          <button 
            onClick={() => setCurrentPage('InvoiceListPage')}
            className="mt-4 text-teal-600 hover:text-teal-800"
          >
            Go back to invoice list
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-blue-100 text-blue-800',
      'Overdue': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };
    
    return `px-3 py-1 text-sm font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const outstanding = selectedInvoice.total - selectedInvoice.amountPaid;

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
              <p className="text-gray-600 mt-1">{selectedInvoice.invoiceNumber}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <EditIcon />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <PrintIcon />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <DownloadIcon />
                Download
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage('InvoiceListPage')}
              >
                Back to List
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Invoice Header Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">{selectedInvoice.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{selectedInvoice.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={getStatusBadge(selectedInvoice.status)}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient Name:</span>
                  <span className="font-medium">{selectedInvoice.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient ID:</span>
                  <span className="font-medium">{selectedInvoice.patientId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedInvoice.services.map((service, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ${service.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${selectedInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">${selectedInvoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">Amount Paid:</span>
                  <span className="font-bold">${selectedInvoice.amountPaid.toFixed(2)}</span>
                </div>
                {outstanding > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="font-medium">Outstanding:</span>
                    <span className="font-bold">${outstanding.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
              {paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">${payment.amount.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">{payment.method}</div>
                          <div className="text-sm text-gray-500">{payment.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">{payment.status}</div>
                          <div className="text-sm text-gray-500">{payment.reference}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                  No payments recorded
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {outstanding > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Outstanding Payment</h3>
                  <p className="text-gray-600">Amount due: ${outstanding.toFixed(2)}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    Send Reminder
                  </Button>
                  <Button variant="primary">
                    Record Payment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsPage;
