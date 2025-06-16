import { useState } from 'react';
import { Button } from '../../common/FormElements';
import { PlusIcon } from '../../common/Icons';

const PaymentTab = ({ patient }) => {
  const [payments] = useState([
    {
      id: 1,
      date: '2024-01-15',
      amount: 275.00,
      method: 'Credit Card',
      reference: 'PMT-2024-001',
      status: 'Completed',
      description: 'Payment for consultation and blood test',
      invoiceId: 'INV-2024-001'
    },
    {
      id: 2,
      date: '2024-01-10',
      amount: 200.00,
      method: 'Cash',
      reference: 'PMT-2024-002',
      status: 'Completed',
      description: 'Payment for X-ray examination',
      invoiceId: 'INV-2024-002'
    },
    {
      id: 3,
      date: '2024-01-01',
      amount: 300.00,
      method: 'Insurance',
      reference: 'PMT-2024-003',
      status: 'Pending',
      description: 'Insurance claim for emergency visit',
      invoiceId: 'INV-2024-003'
    }
  ]);

  const totalPaid = payments
    .filter(payment => payment.status === 'Completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const pendingPayments = payments
    .filter(payment => payment.status === 'Pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800',
      'Refunded': 'bg-blue-100 text-blue-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'Credit Card':
        return (
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'Cash':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'Insurance':
        return (
          <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
        <Button variant="primary" size="sm">
          <PlusIcon />
          Record Payment
        </Button>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Total Paid</div>
          <div className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Pending Payments</div>
          <div className="text-2xl font-bold text-yellow-600">${pendingPayments.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-500">Payment Methods</div>
          <div className="text-2xl font-bold text-gray-900">{new Set(payments.map(p => p.method)).size}</div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {payments.map((payment) => (
          <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getMethodIcon(payment.method)}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Payment #{payment.id}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {payment.date} • Reference: {payment.reference}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${payment.amount.toFixed(2)}
                </div>
                <span className={getStatusBadge(payment.status)}>
                  {payment.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd className="text-sm text-gray-900">{payment.method}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Invoice</dt>
                <dd className="text-sm text-gray-900">{payment.invoiceId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-sm text-gray-900">{payment.status}</dd>
              </div>
            </div>

            <div className="mb-4">
              <dt className="text-sm font-medium text-gray-500 mb-1">Description</dt>
              <dd className="text-sm text-gray-900">{payment.description}</dd>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                View Receipt
              </Button>
              <Button variant="outline" size="sm">
                Print
              </Button>
              {payment.status === 'Completed' && (
                <Button variant="outline" size="sm">
                  Refund
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {payments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments recorded</h3>
            <p className="mt-1 text-sm text-gray-500">Start by recording a new payment.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTab;
