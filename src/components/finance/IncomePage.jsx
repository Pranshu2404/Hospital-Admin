import { useState } from 'react';
import { SearchInput, Button } from '../common/FormElements';
import { PlusIcon, FilterIcon, DownloadIcon } from '../common/Icons';
import { useModal } from '../common/Modals';
import AddIncomeModal from './AddIncomeModal';

const IncomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const { isOpen, openModal, closeModal } = useModal();

  const [incomeRecords] = useState([
    {
      id: 1,
      date: '2024-01-15',
      source: 'Patient Consultation',
      category: 'Service Fee',
      amount: 1500.00,
      patientName: 'John Doe',
      doctorName: 'Dr. Sarah Wilson',
      invoiceId: 'INV-2024-001',
      status: 'Received',
      paymentMethod: 'Credit Card'
    },
    {
      id: 2,
      date: '2024-01-15',
      source: 'Laboratory Services',
      category: 'Diagnostic Fee',
      amount: 750.00,
      patientName: 'Maria Santos',
      invoiceId: 'INV-2024-002',
      status: 'Received',
      paymentMethod: 'Cash'
    },
    {
      id: 3,
      date: '2024-01-14',
      source: 'Surgery',
      category: 'Procedure Fee',
      amount: 5000.00,
      patientName: 'Robert Taylor',
      doctorName: 'Dr. Lisa Anderson',
      invoiceId: 'INV-2024-003',
      status: 'Pending',
      paymentMethod: 'Insurance'
    },
    {
      id: 4,
      date: '2024-01-14',
      source: 'Pharmacy Sales',
      category: 'Medication Sales',
      amount: 300.00,
      invoiceId: 'INV-2024-004',
      status: 'Received',
      paymentMethod: 'Cash'
    },
    {
      id: 5,
      date: '2024-01-13',
      source: 'Emergency Services',
      category: 'Emergency Fee',
      amount: 2000.00,
      patientName: 'Sarah Wilson',
      doctorName: 'Dr. Michael Chen',
      invoiceId: 'INV-2024-005',
      status: 'Received',
      paymentMethod: 'Credit Card'
    }
  ]);

  const filteredRecords = incomeRecords.filter(record => {
    const matchesSearch = record.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.patientName && record.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         record.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = filterSource === 'all' || record.source === filterSource;
    
    return matchesSearch && matchesSource;
  });

  const totalIncome = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
  const receivedIncome = filteredRecords
    .filter(record => record.status === 'Received')
    .reduce((sum, record) => sum + record.amount, 0);
  const pendingIncome = filteredRecords
    .filter(record => record.status === 'Pending')
    .reduce((sum, record) => sum + record.amount, 0);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Received': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const getCategoryBadge = (category) => {
    const categoryClasses = {
      'Service Fee': 'bg-blue-100 text-blue-800',
      'Diagnostic Fee': 'bg-purple-100 text-purple-800',
      'Procedure Fee': 'bg-indigo-100 text-indigo-800',
      'Medication Sales': 'bg-teal-100 text-teal-800',
      'Emergency Fee': 'bg-red-100 text-red-800'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full ${categoryClasses[category] || 'bg-gray-100 text-gray-800'}`;
  };

  const sources = [...new Set(incomeRecords.map(record => record.source))];

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Income Management</h2>
              <p className="text-gray-600 mt-1">Track and manage all revenue sources</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <DownloadIcon />
                Export
              </Button>
              <Button variant="primary" onClick={openModal}>
                <PlusIcon />
                Add Income
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Total Income</div>
              <div className="text-2xl font-bold text-gray-900">${totalIncome.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Received</div>
              <div className="text-2xl font-bold text-green-600">${receivedIncome.toFixed(2)}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">${pendingIncome.toFixed(2)}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by source, patient, or invoice..."
              className="flex-1"
            />
            <div className="flex gap-2">
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="all">All Sources</option>
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
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

        {/* Income Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient/Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
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
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.source}</div>
                    <div className="text-sm text-gray-500">{record.invoiceId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getCategoryBadge(record.category)}>
                      {record.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.patientName && (
                      <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                    )}
                    {record.doctorName && (
                      <div className="text-sm text-gray-500">{record.doctorName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${record.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(record.status)}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-teal-600 hover:text-teal-900">
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No income records found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding a new income record.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <AddIncomeModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export default IncomePage;
