import { useState } from 'react';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, FilterIcon, DownloadIcon, EditIcon, DeleteIcon } from '../common/Icons';

const InvoiceListPage = ({ setCurrentPage, setSelectedInvoice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');

  const [invoices] = useState([
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      date: '2024-01-15',
      dueDate: '2024-02-15',
      patientName: 'John Doe',
      patientId: 'P001',
      services: [
        { name: 'General Consultation', amount: 150.00 },
        { name: 'Blood Test', amount: 75.00 }
      ],
      subtotal: 225.00,
      tax: 22.50,
      total: 247.50,
      amountPaid: 247.50,
      status: 'Paid',
      paymentMethod: 'Credit Card'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      date: '2024-01-14',
      dueDate: '2024-02-14',
      patientName: 'Maria Santos',
      patientId: 'P002',
      services: [
        { name: 'Cardiology Consultation', amount: 300.00 },
        { name: 'ECG', amount: 100.00 }
      ],
      subtotal: 400.00,
      tax: 40.00,
      total: 440.00,
      amountPaid: 0.00,
      status: 'Pending',
      paymentMethod: null
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      date: '2024-01-13',
      dueDate: '2024-02-13',
      patientName: 'Robert Taylor',
      patientId: 'P003',
      services: [
        { name: 'Orthopedic Consultation', amount: 250.00 },
        { name: 'X-Ray', amount: 150.00 }
      ],
      subtotal: 400.00,
      tax: 40.00,
      total: 440.00,
      amountPaid: 200.00,
      status: 'Partial',
      paymentMethod: 'Cash'
    },
    {
      id: 4,
      invoiceNumber: 'INV-2024-004',
      date: '2024-01-12',
      dueDate: '2024-02-12',
      patientName: 'Sarah Wilson',
      patientId: 'P004',
      services: [
        { name: 'Emergency Consultation', amount: 500.00 },
        { name: 'Laboratory Tests', amount: 200.00 }
      ],
      subtotal: 700.00,
      tax: 70.00,
      total: 770.00,
      amountPaid: 770.00,
      status: 'Paid',
      paymentMethod: 'Insurance'
    }
  ]);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = filteredInvoices.length;
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
  const outstandingAmount = totalAmount - paidAmount;

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-blue-100 text-blue-800',
      'Overdue': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setCurrentPage('InvoiceDetailsPage');
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
              <p className="text-gray-600 mt-1">Track and manage patient invoices</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <DownloadIcon />
                Export
              </Button>
              <Button variant="primary">
                <PlusIcon />
                Create Invoice
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Invoices</div>
              <div className="text-2xl font-bold text-gray-900">{totalInvoices}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Paid Amount</div>
              <div className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Outstanding</div>
              <div className="text-2xl font-bold text-red-600">${outstandingAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice number, patient name, or ID..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <Button variant="outline" size="sm">
                <FilterIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.patientName}</div>
                    <div className="text-sm text-gray-500">ID: {invoice.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${invoice.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${invoice.amountPaid.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(invoice.status)}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="text-teal-600 hover:text-teal-900 p-1 rounded"
                      >
                        View
                      </button>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                        <EditIcon />
                      </button>
                      <button className="text-red-400 hover:text-red-600 p-1 rounded">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Start by creating a new invoice.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceListPage;
